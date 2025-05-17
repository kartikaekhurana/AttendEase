import React, { Component } from "react";
import { connect } from "react-redux";
import "../pagesStyles/linkStudentCoursePage.css";

const SuccessNotification = ({ message }) => (
	<div
		className="success-notification"
		style={{
			backgroundColor: "#4CAF50",
			color: "white",
			padding: "10px",
			borderRadius: "5px",
			textAlign: "center",
			marginBottom: "10px",
		}}
	>
		{message}
	</div>
);

export class linkStudentCoursePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			courses: [],
			selectedCourse: "",
			courseId: null,
			courseName: null,
			studentRegNo: "",
			showSuccess: false,
			message: "",
			error: "",
		};
	}

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
		const url = `https://attendease-7wry.onrender.com/api/courses?facultyid=${facultyId}`;
		fetch(url)
			.then((response) => {
				if (!response.ok) throw new Error("Failed to fetch courses.");
				return response.json();
			})
			.then((data) => this.setState({ courses: data, loading: false }))
			.catch((error) => this.setState({ error, loading: false }));
	};

	handleCourseChange = (event) => {
		const courseId = event.target.value;
		this.setState({ selectedCourse: courseId });
		console.log("selectedCourse: ", courseId);
	};

	handleStudentChange = (event) => {
		const studentReg = event.target.value;
		console.log("studentReg: ", studentReg);
		this.setState({ studentRegNo: studentReg });
	};

	handleAddStudent = async () => {
		const { selectedCourse, studentRegNo } = this.state;

		if (!selectedCourse || !studentRegNo) {
			this.setState({ message: "Course and student must be selected!" });
			return;
		}
		const url = `https://attendease-7wry.onrender.com/api/course/link`;

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					student_reg: studentRegNo,
					course_id: selectedCourse,
					enrollment_date: "",
				}),
			});
			const data = await response.json();

			if (!response.ok) {
				this.setState({
					error: data.error+"!!!",
				});
				setTimeout(() => {
					this.setState({ error: "" });
				}, 2000);
				
				throw new Error(
					data.error || "Failed to register student for course!!!"
				);
			}
			this.setState({
				message: data.message,
				error: "",
				showSuccess: true,
				courseId: null,
				courseName: null,
				studentRegNo: "",
				selectedCourse: "",
			});
			setTimeout(() => {
				this.setState({ showSuccess: false });
			}, 2000);
		} catch (err) {
			console.log(err);
			this.setState({ message: err.message });
		}
	};

	componentDidMount() {
		this.fetchCourses();
	}

	render() {
		const { courses, selectedCourse, showSuccess, message, error } =
			this.state;

		return (
			<div
				className="settings-page"
				style={{
					backgroundImage: "url('/assets/home_background.jpg')",
					position: "absolute",
				}}
			>
				<div className="manage-course-form-div">
					<h1 className="manage-course-form-title">
						Add student to Course
					</h1>
					{showSuccess && (
						<SuccessNotification
							style={{ color: "black" }}
							message={message}
						/>
					)}
					{error && (
						<div
							className="error-message"
							style={{
								textAlign: "center",
								backgroundColor: "red",
								color: "black",
								padding: "5px 10px",
								borderRadius: "5px",
								marginTop: "10px"
							}}
						>
							{error}
						</div>
					)}
					<div
						className="manage-course-form-input-div"
						style={{ marginTop: "50px" }}
					>
						<div className="manage-course-form-row">
							<label>Course Code:</label>
							<select
								className="link-course-select"
								onChange={this.handleCourseChange}
								value={selectedCourse}
							>
								<option
									value="disabled"
									className="link-course-option"
								>
									-- Select Course --
								</option>
								{courses.map((course) => (
									<option
										key={course.course_id}
										value={course.course_id}
										className="link-course-option"
									>
										{course.course_name} (
										{course.course_code})
									</option>
								))}
							</select>
						</div>
						<div className="manage-course-form-row">
							<label>Student Reg. No. :</label>
							<input
								className="manage-course-form-input"
								type="text"
								value={this.state.studentRegNo}
								onChange={this.handleStudentChange}
							/>
						</div>
						<div className="manage-course-form-submit-div">
							<button
								className="manage-course-submit-btn"
								type="submit"
								onClick={this.handleAddStudent}
							>
								Add Student
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
});

export default connect(mapStateToProps)(linkStudentCoursePage);
