import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { pool } from "./db.js"; // Your DB connection
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./dot.env" });

const app = express();

app.use(
  cors({
    origin: "https://attendease786.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error("SECRET_KEY not found in environment variables.");
  process.exit(1);
}

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server is running");
  console.log("Secret Key:", SECRET_KEY);
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const user = result.rows[0];
    // TODO: Use hashed passwords in production!
    if (password !== user.password_hash) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user.facultyid, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.facultyid,
        email: user.email,
        fname: user.firstname,
        lname: user.lastname,
        role: user.role,
        mobile: user.mobile,
        age: user.age,
        dept: user.dept,
        cabin: user.cabin,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// REGISTER USER
app.post("/api/register", async (req, res) => {
  const { facultyid, email, password, fname, lname, dob, role, mobile, dept, cabin } = req.body;

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const result = await pool.query(
      `INSERT INTO users (facultyid, email, password_hash, firstname, lastname, dob, mobile, role, dept, cabin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [facultyid, email, password, fname, lname, dob, mobile, role, dept, cabin]
    );

    res.status(201).json({ message: "User registered successfully!", user: result.rows[0] });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROFILE
app.put("/api/profile", async (req, res) => {
  const { id, fname, lname, dept, mobile } = req.body;
  try {
    await pool.query(
      `UPDATE users SET firstname = $1, lastname = $2, dept = $3, mobile = $4 WHERE facultyid = $5`,
      [fname, lname, dept, mobile, id]
    );

    const updatedUser = await pool.query("SELECT * FROM users WHERE facultyid = $1", [id]);
    res.status(200).json(updatedUser.rows[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "An error occurred!", details: err.message });
  }
});

// REGISTER STUDENT
app.post("/api/students/register", async (req, res) => {
  const { student_id, fname, lname, email } = req.body;

  if (!student_id || !fname || !lname || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existingStudent = await pool.query(
      "SELECT * FROM student WHERE student_id = $1 OR email = $2",
      [student_id, email]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(409).json({ error: "Student with this ID or Email already exists" });
    }

    const result = await pool.query(
      `INSERT INTO student (student_id, fname, lname, email) VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, fname, lname, email]
    );

    res.status(201).json({ message: "Student registered successfully!", student: result.rows[0] });
  } catch (err) {
    console.error("Error registering student:", err);
    res.status(500).json({ error: err.message });
  }
});

// REGISTER COURSE
app.post("/api/course/register", async (req, res) => {
  const { facultyid, course_name, course_code } = req.body;

  if (!facultyid || !course_name || !course_code) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existingCourse = await pool.query(
      "SELECT * FROM course WHERE course_code = $1 OR course_name = $2",
      [course_code, course_name]
    );

    if (existingCourse.rows.length > 0) {
      return res.status(409).json({ error: "Course code or name already exists" });
    }

    const result = await pool.query(
      `INSERT INTO course (facultyid, course_name, course_code) VALUES ($1, $2, $3) RETURNING *`,
      [facultyid, course_name, course_code]
    );

    res.status(201).json({ message: "Course registered successfully!", course: result.rows[0] });
  } catch (err) {
    console.error("Error registering course:", err);
    res.status(500).json({ error: err.message });
  }
});

// LINK STUDENT TO COURSE
app.post("/api/course/link", async (req, res) => {
  const { student_reg, course_id } = req.body;
  const date = new Date().toISOString().split("T")[0];

  if (!student_reg || !course_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Get si_no from student_reg
    const studentResult = await pool.query("SELECT si_no FROM student WHERE student_id = $1", [student_reg]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const si_no = studentResult.rows[0].si_no;

    // Check if attendance table exists, create if not
    const attendanceTableName = `attendance_${course_id}`;
    const attendanceTableCheck = `
      SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = $1
      )`;
    const attendanceTableResult = await pool.query(attendanceTableCheck, [attendanceTableName]);

    if (!attendanceTableResult.rows[0].exists) {
      const createAttendanceTable = `
        CREATE TABLE IF NOT EXISTS ${attendanceTableName} (
          si_no INTEGER NOT NULL PRIMARY KEY,
          student_id VARCHAR(9) NOT NULL UNIQUE,
          CONSTRAINT attendance_si_no_fkey FOREIGN KEY (si_no) REFERENCES student(si_no),
          CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES student(student_id)
        );`;
      await pool.query(createAttendanceTable);

      const fillAttendanceTable = `
        INSERT INTO ${attendanceTableName} (si_no, student_id)
        SELECT e.si_no, s.student_id
        FROM enrollment e
        JOIN student s ON e.si_no = s.si_no
        WHERE e.course_id = $1;`;
      await pool.query(fillAttendanceTable, [course_id]);
    }

    // Check if already enrolled
    const existingLink = await pool.query(
      "SELECT * FROM enrollment WHERE si_no = $1 AND course_id = $2",
      [si_no, course_id]
    );

    if (existingLink.rows.length > 0) {
      return res.status(409).json({ error: "Student already enrolled in this course" });
    }

    // Insert enrollment and update attendance
    const insertEnrollment = `
      INSERT INTO enrollment (si_no, course_id, enrollment_date)
      VALUES ($1, $2, $3) RETURNING *;`;
    const insertAttendance = `
      INSERT INTO ${attendanceTableName} (si_no, student_id)
      VALUES ($1, $2) RETURNING *;`;

    const enrollmentResult = await pool.query(insertEnrollment, [si_no, course_id, date]);
    await pool.query(insertAttendance, [si_no, student_reg]);

    res.status(201).json({ message: "Student linked successfully!", enrollment: enrollmentResult.rows[0] });
  } catch (err) {
    console.error("Error linking student to course:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE STUDENT
app.delete("/api/students/:student_id", async (req, res) => {
  const { student_id } = req.params;
  try {
    await pool.query("DELETE FROM student WHERE student_id = $1", [student_id]);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE COURSE
app.delete("/api/course/:course_code", async (req, res) => {
  const { course_code } = req.params;
  try {
    await pool.query("DELETE FROM course WHERE course_code = $1", [course_code]);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await pool.query("SELECT * FROM student ORDER BY si_no");
    res.json(students.rows);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await pool.query("SELECT * FROM course ORDER BY course_id");
    res.json(courses.rows);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get students linked to a course
app.get("/api/course/:course_id/students", async (req, res) => {
  const { course_id } = req.params;
  try {
    const linkedStudents = await pool.query(
      `SELECT s.* FROM student s 
       JOIN enrollment e ON s.si_no = e.si_no 
       WHERE e.course_id = $1 ORDER BY s.si_no`,
      [course_id]
    );
    res.json(linkedStudents.rows);
  } catch (err) {
    console.error("Error fetching linked students:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
