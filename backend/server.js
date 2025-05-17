import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { pool } from "./db.js"; // Note the `.js` extension if using ES modules
import cors from "cors";
import dotenv from "dotenv";
import { execFile } from "child_process";

//    ----    ----    ----    ----    ----    ----

dotenv.config({ path: "./dot.env" });

//    ----    ----    ----    ----    ----    ----
const express = require('express');
const cors = require('cors');  // Declare only once here

const app = express();

// Then use it later
app.use(
  cors({
    origin: "https://attendease786.netlify.app",
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


//    ----    ----    ----    ----    ----    ----
// Use body parser middleware for JSON
//    ----    ----    ----    ----    ----    ----

app.use(bodyParser.json());

//    ----    ----    ----    ----    ----    ----

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
	console.error("SECRET_KEY not found in environment variables.");
	process.exit(1);
}

//    ----    ----    ----    ----    ----    ----

//     ----    ROOT ENDPOINT    ----

//    ----    ----    ----    ----    ----    ----

app.get("/", (req, res) => {
	res.send("Server is running");
	console.log("Secret Key: ", SECRET_KEY);
});

//    ----    ----    ----    ----    ----    ----

//    ----    LOGIN ENDPOINT    ----

//    ----    ----    ----    ----    ----    ----

app.post("/api/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		console.log("Received email: ", email);
		const result = await pool.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);
		console.log("Query result: ", result.rows);

		if (result.rows.length === 0) {
			return res.status(401).json({ message: "User does not exist" });
		}

		const user = result.rows[0];
		const passwordMatch = password === user.password_hash ? true : false;

		if (!passwordMatch) {
			return res.status(401).json({ message: "Incorrect password" });
		}

		const token = jwt.sign(
			{ id: user.facultyid, email: user.email },
			SECRET_KEY,
			{ expiresIn: "1h" }
		);

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
		console.error("Error:", err);
		res.status(500).json({ message: "Server error", err: err.message });
	}
});

//    ----    ----    ----    ----    ----    ----

//    ----    REGISTER USER    ----

//    ----    ----    ----    ----    ----    ----

app.post("/api/register", async (req, res) => {
	const {
		facultyid,
		email,
		password,
		fname,
		lname,
		dob,
		role,
		mobile,
		dept,
		cabin,
	} = req.body;

	try {
		const userCheck = await pool.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);
		if (userCheck.rows.length > 0) {
			return res.status(400).json({ message: "User already exists" });
		} else {
			const result = await pool.query(
				"INSERT INTO users (facultyid, email, password_hash, firstname, lastname, dob, mobile, role, dept, cabin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
				[
					facultyid,
					email,
					password,
					fname,
					lname,
					dob,
					mobile,
					role,
					dept,
					cabin,
				]
			);

			res.status(201).json({
				message: "User registered successfully!",
				user: result.rows[0],
			});
		}
	} catch (err) {
		console.error("Error:", err);
		res.status(500).json({ message: err.message });
	}
});

//    ----    ----    ----    ----    ----    ----

//    ----    UPDATE PROFILE ENDPOINT    ----

//    ----    ----    ----    ----    ----    ----

app.put("/api/profile", async (req, res) => {
	const { id, fname, lname, dept, mobile } = req.body;
	try {
		await pool.query(
			"UPDATE users SET firstname = $1, lastname = $2, dept = $3, mobile = $4 WHERE facultyid = $5",
			[fname, lname, dept, mobile, id]
		);

		const updatedUser = await pool.query(
			"SELECT * FROM users WHERE facultyid = $1",
			[id]
		);
		console.log("res", updatedUser);
		res.status(200).json(updatedUser.rows[0]);
	} catch (err) {
		console.error("Error updating profile: ", err);
		res.status(500).json({
			error: "An error occured!",
			details: err.message,
		});
	}
});

//    ----    ----    ----    ----    ----    ----

//    ----    REGISTER STUDENT ENDPOINT    ----

//    ----    ----    ----    ----    ----    ----

app.post("/api/students/register", async (req, res) => {
	try {
		const { student_id, fname, lname, email } = req.body;

		if (!student_id || !fname || !lname || !email) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const existingstudent = await pool.query(
			"SELECT * FROM student WHERE student_id = $1 OR EMAIL = $2",
			[student_id, email]
		);

		if (existingstudent.rows.length > 0) {
			return res.status(409).json({
				error: "Student with this ID or Email already exists",
			});
		}

		const insertQuery = `
		INSERT INTO STUDENT (student_id, fname, lname, email)
		VALUES ($1, $2, $3, $4)
		RETURNING *
		`;
		const result = await pool.query(insertQuery, [
			student_id,
			fname,
			lname,
			email,
		]);

		res.status(201).json({
			message: "Student registered successfully!!!",
			student: result.rows[0],
		});
	} catch (err) {
		console.error("Error registering student:", err);
		res.status(500).json({
			error: err.message,
		});
	}
});

//    ----    ----    ----    ----    ----    ----

//    ----    REGISTER COURSE ENDPOINT    ----

//    ----    ----    ----    ----    ----    ----

app.post("/api/course/register", async (req, res) => {
	try {
		const { facultyid, course_name, course_code } = req.body;
		if (!facultyid || !course_name || !course_code) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const existingcourse = await pool.query(
			"SELECT * FROM course WHERE course_code = $1 OR course_name = $2",
			[course_code, course_name]
		);

		if (existingcourse.rows.length > 0) {
			return res.status(409).json({
				error: err.message,
			});
		}

		const insertquery = `
		INSERT INTO course (facultyid, course_name, course_code)
		VALUES ($1, $2, $3)
		RETURNING *;
		`;

		const result = await pool.query(insertquery, [
			facultyid,
			course_name,
			course_code,
		]);
		res.status(201).json({
			message: "Course registered successfully!!!",
			student: result.rows[0],
		});
	} catch (err) {
		console.error("Course could not be registered!!!: ", err);
		res.status(500).json({
			error: err.message,
		});
	}
});

//    ----    ----    ----    ----    ----    ----

//    ----    LINK STUDENT-COURSE ENDPOINT    ----

//    ----    ----    ----    ----    ----    ----

app.post("/api/course/link", async (req, res) => {
	try {
		const { student_reg, course_id } = req.body;
		const date = new Date().toISOString().split("T")[0];

		if (!student_reg || !course_id) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		// Step 0: Get si_no from student_reg
		const studentQuery = "SELECT si_no FROM student WHERE student_id = $1";
		const studentResult = await pool.query(studentQuery, [student_reg]);

		if (studentResult.rows.length === 0) {
			return res.status(404).json({ error: "Student not found" });
		}

		const si_no = studentResult.rows[0].si_no;

		// Step 1: Check attendance_table

		const attendanceTableCheck = `SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'attendance_${course_id}');`;
		const attendanceTableResult = await pool.query(attendanceTableCheck);

		const tableExists = attendanceTableResult.rows[0].exists;
		if (!tableExists) {
			const createAttendanceTable = `
				CREATE TABLE IF NOT EXISTS attendance_${course_id}
				(
				si_no INTEGER NOT NULL,
				student_id VARCHAR(9) NOT NULL,
				PRIMARY KEY (si_no),
				CONSTRAINT unique_student_id_${course_id} UNIQUE (student_id),
				CONSTRAINT attendance_si_no_fkey_${course_id} FOREIGN KEY (si_no) REFERENCES student(si_no),
				CONSTRAINT attendance_student_id_fkey_${course_id} FOREIGN KEY (student_id) REFERENCES student(student_id)
				);
			`;
			await pool.query(createAttendanceTable);

			const fillAttendanceTable = `
				INSERT INTO attendance_${course_id}
				(si_no, student_id)
				SELECT e.si_no, s.student_id
				FROM enrollment e
				JOIN student s ON e.si_no = s.si_no
				WHERE e.course_id = $1;
			`;
			await pool.query(fillAttendanceTable, [course_id]);
		}

		// Step 2: Check if student is already enrolled
		const existinglink = await pool.query(
			"SELECT * FROM enrollment WHERE si_no = $1 AND course_id = $2",
			[si_no, course_id]
		);

		if (existinglink.rows.length > 0) {
			return res
				.status(409)
				.json({ error: "Student already enrolled in this course" });
		}

		// Step 3: Insert into enrollment table
		const insertQuery = `
			INSERT INTO enrollment (si_no, course_id, enrollment_date)
			VALUES ($1, $2, $3)
			RETURNING *;
		`;

		const updateAttendanceTable = `
		INSERT INTO attendance_${course_id} (si_no, student_id)
		VALUES ($1, $2)
		RETURNING *;
		`;

		const result = await pool.query(insertQuery, [si_no, course_id, date]);
		const uodated = await pool.query(updateAttendanceTable, [
			si_no,
			student_reg,
		]);
		res.status(201).json({
			message: "Student linked successfully!!!",
			student: result.rows[0],
		});
	} catch (err) {
		console.error("Course could not be linked!!!: ", err);
		res.status(500).json({ error: err.message });
	}
});

//    ----    ----    ----    ----    ----    ----

//    ----    GET COURSE DETAILS    ----

//    ----    ----    ----    ----    ----    ----

app.get("/api/courses", async (req, res) => {
	try {
		const facultyid = req.query.facultyid;
		if (!facultyid) {
			return res
				.status(400)
				.json({ error: "Faculty ID not found in token." });
		}
		const query = "SELECT * FROM course WHERE facultyid = $1";
		const { rows } = await pool.query(query, [facultyid]);
		res.json(rows);
	} catch (err) {
		console.log("Error: ", err.message);
		res.status(500).json({ error: err.message });
	}
});

//    ----    ----    ----    ----    ----    ----

// Endpoint: Initialize Attendance

//    ----    ----    ----    ----    ----    ----
// This endpoint calls the stored procedure to ensure the attendance table and date column exist.

app.post("/api/attendance/init", async (req, res) => {
	try {
		const { courseId, attendanceDate } = req.body;
		if (!courseId || !attendanceDate) {
			return res
				.status(400)
				.json({ error: "Missing courseId or attendanceDate" });
		}
		// Call the stored procedure add_attendance_date(courseId, attendanceDate)
		await pool.query("SELECT add_attendance_date($1, $2)", [
			courseId,
			attendanceDate,
		]);
		res.status(200).json({
			message: "Attendance table initialized successfully",
		});
	} catch (err) {
		console.error("Error initializing attendance:", err);
		res.status(500).json({ error: err.message });
	}
});

//    ----    ----    ----    ----    ----    ----

// Get student details in a course for display

//    ----    ----    ----    ----    ----    ----

app.get("/api/students", async (req, res) => {
	try {
		const { courseId } = req.query;
		if (!courseId) {
			return res
				.status(400)
				.json({ error: "Missing courseId parameter." });
		}

		// Build the query:
		// - Join the student and enrollment tables on s.si_no = e.si_no.
		// - Use a LEFT JOIN with calculate_attendance_percent($1) to get the attendance percentage.
		//   Note: We join on s.student_id = a.student_id because the function returns "student_id".
		const query = `
      SELECT 
        s.student_id,
        s.fname,
        s.lname,
        s.email,
        COALESCE(a.attendance_percent, 0) AS attendance_percent
      FROM student s
      JOIN enrollment e ON s.si_no = e.si_no
      LEFT JOIN calculate_attendance_percent($1) a ON s.student_id = a.student_id
      WHERE e.course_id = $1
    `;

		const { rows } = await pool.query(query, [courseId]);

		if (rows.length === 0) {
			return res
				.status(404)
				.json({ message: "No students found for this course!" });
		}

		res.json(rows);
	} catch (err) {
		console.error("Error: ", err.message);
		res.status(500).json({ error: err.message });
	}
});



// ---- Facial Recognition Endpoint ----
app.post("/api/attendance/recognize", async (req, res) => {
	try {
		const { courseId, studentId, image } = req.body;

		if (!courseId || !studentId || !image) {
			return res.status(400).json({ error: "Missing required fields!" });
		}

		const scriptPath = "./face_recognition_attendance.py";

		execFile(
			"python",
			[scriptPath, studentId, image],
			(error, stdout, stderr) => {
				if (error) {
					console.error("Python script execution error:", error);
					return res.status(500).json({
						error: "Facial recognition script failed.",
					});
				}
				try {
					const result = JSON.parse(stdout);
					res.status(200).json(result);
				} catch (parseErr) {
					console.error("Error parsing Python output:", parseErr);
					res.status(500).json({ error: "Invalid response from script." });
				}
			}
		);
	} catch (err) {
		console.error("Error in recognition endpoint:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});



//    ----    ----    ----    ----    ----    ----

// Endpoint: Submit Attendance

//    ----    ----    ----    ----    ----    ----
// This endpoint updates (or inserts) attendance data for each student in the attendance table.

app.post("/api/attendance/submit", async (req, res) => {
	try {
		const { courseId, attendanceDate, attendanceData } = req.body;
		if (!courseId || !attendanceDate || !attendanceData) {
			return res.status(400).json({
				error: "Missing courseId/attendanceDate/attendanceData",
			});
		}

		const dateObj = new Date(attendanceDate);
		const day = String(dateObj.getDate()).padStart(2, "0");
		const month = String(dateObj.getMonth() + 1).padStart(2, "0");
		const year = String(dateObj.getFullYear());
		const colName = `${year}_${month}_${day}`;

		const tableName = `attendance_${courseId}`;

		// Check if attendance table exists
		const tableCheckQuery = `
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = $1
		) AS exists;
		`;
		const tableCheckResult = await pool.query(tableCheckQuery, [tableName]);

		if (!tableCheckResult.rows[0].exists) {
			// Create table if it doesn't exist
			const createTableQuery = `
				CREATE TABLE ${tableName} (
					si_no SERIAL PRIMARY KEY,
					student_id VARCHAR(20) UNIQUE NOT NULL
				)
			`;
			await pool.query(createTableQuery);
		}

		// Ensure all enrolled students are in attendance table
		const fetchStudentsQuery = `
			SELECT s.si_no, s.student_id 
			FROM enrollment e 
			JOIN student s ON e.si_no = s.si_no 
			WHERE e.course_id = $1
			AND s.student_id NOT IN (SELECT student_id FROM ${tableName});
		`;
		const studentResult = await pool.query(fetchStudentsQuery, [courseId]);

		for (const student of studentResult.rows) {
			const insertStudentQuery = `
				INSERT INTO ${tableName} (si_no, student_id) VALUES ($1, $2)
				ON CONFLICT (student_id) DO NOTHING;
			`;
			await pool.query(insertStudentQuery, [
				student.si_no,
				student.student_id,
			]);
		}

		// Check if column exists for the attendance date
		const columnCheckQuery = `
			SELECT EXISTS (
				SELECT 1
				FROM information_schema.columns
				WHERE table_schema = 'public'
				AND table_name = $1
				AND column_name = $2
			) AS exists;
		`;
		const columnCheckResult = await pool.query(columnCheckQuery, [
			tableName,
			colName,
		]);

		if (!columnCheckResult.rows[0].exists) {
			const alterQuery = `ALTER TABLE ${tableName} ADD COLUMN "${colName}" boolean`;
			await pool.query(alterQuery);
		}

		// Insert or update attendance records
		for (const record of attendanceData) {
			const { student_id, present } = record;

			const updateQuery = `UPDATE ${tableName} SET "${colName}" = $1 WHERE student_id = $2`;
			const updateResult = await pool.query(updateQuery, [
				present,
				student_id,
			]);

			if (updateResult.rowCount === 0) {
				const insertQuery = `
					INSERT INTO ${tableName} (student_id, "${colName}")
					VALUES ($1, $2)
					ON CONFLICT (student_id) DO UPDATE SET "${colName}" = EXCLUDED."${colName}";
				`;
				await pool.query(insertQuery, [student_id, present]);
			}
		}

		res.status(200).json({
			message: "Attendance submitted successfully!!!",
		});
	} catch (err) {
		console.error("Error submitting attendance: ", err);
		res.status(500).json({ error: err.message });
	}
});

//    ----    ----    ----    ----    ----    ----

//    ----    Facial Recognition    ----

//    ----    ----    ----    ----    ----    ----

app.post("/api/attendance/recognize", async (req, res) => {
	try {
		const { courseId, studentId, image } = req.body;
		if (!courseId || !studentId || !image) {
			return res.status(400).json({ error: "Missing required fields!!" });
		}

		execFile(
			"python3",
			["./face_recognition_attendance.py", studentId, image],
			(error, stdout, stderr) => {
				if (error) {
					console.error("error executing Python script: ", error);
					return res
						.status(500)
						.json({
							error: "Error processing facial recognition!!!",
						});
				}
				try {
					const result = JSON.parse(stdout);
					return res.status(200).json(result);
				} catch (parseError) {
					console.error(
						"Error parsing Python script output: ",
						parseError
					);
					return res
						.status(500)
						.json({
							error: "Error processing facial recognition output!!!",
						});
				}
			}
		);
	} catch (err) {
		console.error("Error in /api/attendance/recognize: ", err);
		res.status(500).json({ error: err.message });
	}
});

//    ----    ----    ----    ----    ----    ----

//    ----    Start the server    ----

//    ----    ----    ----    ----    ----    ----

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
