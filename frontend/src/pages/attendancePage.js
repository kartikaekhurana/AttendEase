import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import Webcam from "react-webcam";
import "../pagesStyles/attendancePage.css";

const SuccessNotification = ({ message }) => (
	<div
		className="success-notification"
		style={{
			backgroundColor: "#4CAF50",
			color: "white",
			padding: "10px",
			borderRadius: "5px",
			textAlign: "center",
			margin: "20px auto", // Centers the div horizontally
			width: "70%", // Adjust as needed for ample margin
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			boxShadow: "0px 5px 12px rgba(0, 0, 0, 0.3)",
		}}
	>
		{message}
	</div>
);

export class attendancePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			courses: [],
			selectedCourse: "", // Stores course selected in dropdown
			courseId: null, // Set when "Choose course" is clicked
			courseName: null,
			studentsData: {}, // Object with courseId as key, and student array as value
			attendanceMap: {}, // Object mapping each student_id to an object: { present: boolean }
			attendanceDate: "",
			loading: true,
			showSuccess: false,
			error: null,
			message: "",
			showCamera: false,
		};
		this.webcamRef = createRef();
	}

	// Fetch courses allocated to the faculty
	fetchCourses = async () => {
		const { user } = this.props;
		if (!user || !user.id) {
			this.setState({
				error: { message: "Faculty ID not available." },
				loading: false,
			});
			return;
		}
		const facultyId = user.id;
		const url = `http://localhost:5000/api/courses?facultyid=${facultyId}`;
		fetch(url)
			.then((response) => {
				if (!response.ok) throw new Error("Failed to fetch courses.");
				return response.json();
			})
			.then((data) => this.setState({ courses: data, loading: false }))
			.catch((error) => this.setState({ error, loading: false }));
	};

	// Fetch students for the selected course using GET /api/students endpoint
	fetchStudents = async () => {
		const courseId = this.state.courseId;
		if (!courseId) return;
		// If students for this course are already fetched, we skip fetching again.
		if (this.state.studentsData[courseId]) return;

		const url = `http://localhost:5000/api/students?courseId=${courseId}`;
		fetch(url)
			.then((response) => {
				if (!response.ok) throw new Error("Failed to fetch students");
				return response.json();
			})
			.then((data) => {
				// Build attendance map: each student's id maps to { present: false }
				const attendanceMap = data.reduce((acc, student) => {
					acc[student.student_id] = { present: false };
					return acc;
				}, {});
				// Update state: preserve existing studentsData and add the new data under the courseId key
				this.setState((prevState) => ({
					studentsData: {
						...prevState.studentsData,
						[courseId]: data,
					},
					attendanceMap: attendanceMap,
				}));
				console.log("Attendance Map:", attendanceMap);
			})
			.catch((err) => {
				console.error("Error fetching students:", err);
				this.setState({ message: "Error fetching students" });
			});
	};

	// When the dropdown selection changes
	handleCourseChange = (event) => {
		const selectedId = event.target.value;
		// Find the corresponding course object
		const selectedCourseObj = this.state.courses.find(
			(course) => course.course_id.toString() === selectedId
		);
		const selectedName = selectedCourseObj
			? selectedCourseObj.course_name
			: "";
		this.setState({
			selectedCourse: selectedId,
			courseName: selectedName,
		});
	};

	// When the "Choose course" button is clicked, set courseId and fetch students
	handleSubmitCourse = () => {
		// Update courseId using setState (do not assign directly)
		this.setState({ courseId: this.state.selectedCourse }, () => {
			this.fetchStudents();
		});
	};

	handleCaptureFace = async (studentId) => {
		this.setState({ showCamera: true });

		// Give the camera time to initialize
		setTimeout(async () => {
			if (this.webcamRef.current) {
				const imageSrc = this.webcamRef.current.getScreenshot();

				if (!imageSrc) {
					this.setState({
						message: "Webcam not ready or no frame captured.",
					});
					return;
				}

				try {
					const response = await fetch(
						"http://localhost:5000/api/attendance/recognize",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								courseId: this.state.courseId,
								studentId: studentId,
								image: imageSrc,
							}),
						}
					);
					const data = await response.json();

					if (response.ok && data.recognized) {
						this.setState((prevState) => ({
							attendanceMap: {
								...prevState.attendanceMap,
								[studentId]: { present: true },
							},
							message: `Attendance marked for ${data.studentName}`,
							showSuccess: true,
							showCamera: false, // Hide webcam
						}));
						setTimeout(
							() => this.setState({ showSuccess: false }),
							2000
						);
					} else {
						this.setState({
							message: "Face not recognized.",
							showCamera: false,
						});
					}
				} catch (err) {
					console.error("Error during facial recognition: ", err);
					this.setState({
						message: "Recognition error occurred.",
						showCamera: false,
					});
				}
			}
		}, 1000); // Delay to allow webcam to fully load
	};

	handleSubmitAttendance = () => {
		const { courseId, attendanceMap, attendanceDate } = this.state;

		if (!courseId || !attendanceDate) {
			this.setState({ message: "Course and date must be selected!" });
			return;
		}

		const attendanceData = Object.entries(attendanceMap).map(
			([student_id, record]) => ({
				student_id,
				present: record.present,
			})
		);

		fetch("http://localhost:5000/api/attendance/submit", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				courseId,
				attendanceDate,
				attendanceData,
			}),
		})
			.then((response) =>
				response
					.json()
					.then((data) => ({ status: response.status, data }))
			)
			.then(({ status, data }) => {
				if (status === 200) {
					this.setState({ message: data.message, showSuccess: true });
					setTimeout(() => {
						this.setState({
							selectedCourse: "",
							courseId: null,
							courseName: null,
							studentsData: {},
							attendanceMap: {},
							showSuccess: false,
							message: "",
							error: "",
						});
					}, 2000);
				} else {
					this.setState({
						message: "Submission Failed: " + data.error,
					});
				}
			})
			.catch((err) => {
				console.error("Error submitting attendance: ", err);
				this.setState({ message: "Error submitting attendance!!!" });
			});
	};

	componentDidMount() {
		this.fetchCourses();
		const today = new Date();
		const formattedDate = today.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
		this.setState({ attendanceDate: formattedDate });
	}

	// When a checkbox is toggled, update the attendanceMap accordingly
	handleCheckboxChange = (student_id, value) => {
		console.log(student_id, " ", value);
		this.setState((prevState) => ({
			attendanceMap: {
				...prevState.attendanceMap,
				[student_id]: { present: value },
			},
		}));
	};

	render() {
		const {
			courses,
			selectedCourse,
			courseId,
			courseName,
			studentsData,
			attendanceMap,
			loading,
			showSuccess,
			error,
			message,
		} = this.state;
		const { showCamera } = this.state;
		// Retrieve the student array for the active course (if available)
		const studentsList =
			courseId && studentsData[courseId] ? studentsData[courseId] : [];

		return (
			<div
				className="home-page"
				style={{
					backgroundImage: "url('/assets/home_background.jpg')",
					position: "absolute",
					width: "100%",
					height: "100%",
					padding: "20px",
					boxSizing: "border-box",
				}}
			>
				<h1 style={{ color: "white" }}>
					{courseId
						? `Take Attendance for Course ${courseName}`
						: "Select a Course to Take Attendance"}
				</h1>
				{!loading && !error && courses.length > 0 && (
					<div className="attendance-course-div">
						<select
							className="attendance-course-select"
							onChange={this.handleCourseChange}
							value={selectedCourse}
						>
							<option value="" disabled>
								-- Select Course --
							</option>
							{courses.map((course) => (
								<option
									key={course.course_id}
									value={course.course_id}
								>
									{course.course_name} ({course.course_code})
								</option>
							))}
						</select>
						<button
							className="attendance-course-btn"
							onClick={this.handleSubmitCourse}
							disabled={!selectedCourse}
							style={{
								marginLeft: "10px",
								padding: "10px",
								color: !selectedCourse
									? "rgba(0,0,0,0.8)"
									: "black",
							}}
						>
							Choose Course
						</button>
					</div>
				)}
				{error && <p>Error: {error.message}</p>}

				{showCamera && (
					<div className="webcam-wrapper">
						<Webcam
							audio={false}
							ref={this.webcamRef}
							screenshotFormat="image/jpeg"
							width={320}
							height={240}
							className="webcam-feed"
						/>
					</div>
				)}

				{courseId && studentsList.length > 0 && (
					<div
						className="attendance-students-div"
						style={{ marginTop: "20px", padding: "10px" }}
					>
						<div className="attendance-date-div">
							<label style={{ paddingLeft: "40px" }}>
								Attendance Date:{" "}
							</label>
							<input
								className="attendance-calendar"
								type="date"
								value={this.state.attendanceDate}
								onChange={(e) =>
									this.setState({
										attendanceDate: e.target.value,
									})
								}
							/>
						</div>

						<h2>Student Details</h2>

						{showSuccess && (
							<SuccessNotification
								style={{ color: "black" }}
								message={message}
							/>
						)}
						<table className="attendance-students-table">
							<thead>
								<tr>
									<th className="attendance-student-head">
										Student ID
									</th>
									<th className="attendance-student-head">
										Student Name
									</th>
									<th className="attendance-student-head">
										Present
									</th>
								</tr>
							</thead>
							<tbody>
								{studentsList.map((student) => (
									<tr
										key={student.student_id}
										className="attendance-student-row"
									>
										<td className="attendance-student-cell">
											{student.student_id}
										</td>
										<td
											style={{
												textAlign: "left",
												paddingLeft: "10%",
											}}
										>
											{student.fname} {student.lname}
										</td>
										<td>
											<input
												type="checkbox"
												checked={
													attendanceMap &&
													attendanceMap[
														student.student_id
													]
														? attendanceMap[
																student
																	.student_id
														  ].present
														: false
												}
												onChange={(e) =>
													this.handleCheckboxChange(
														student.student_id,
														e.target.checked
													)
												}
											/>
											<button
												style={{
													marginLeft: "10px",
													padding: "5px",
													border: "0px",
													backgroundColor:
														"rgba(0,0,0,0.6)",
													color: "peachpuff",
												}}
												onClick={() =>
													this.handleCaptureFace(
														student.student_id
													)
												}
											>
												Face Scan
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<button
							className="attendance-submit-btn"
							onClick={this.handleSubmitAttendance}
							style={{
								marginLeft: "10px",
								padding: "10px",
								color: !selectedCourse
									? "rgba(0,0,0,0.8)"
									: "black",
							}}
						>
							Submit Attendance
						</button>
					</div>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
});

export default connect(mapStateToProps)(attendancePage);
