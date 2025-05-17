import React, { Component } from "react";
import { connect } from "react-redux";
import "../pagesStyles/registerCoursePage.css";

// Custom SuccessNotification component
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

export class RegisterCoursePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			course_name: "",
			course_code: "",
			message: "",
			error: "",
			showSuccess: false,
		};
	}

	handleChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	handleSubmit = async (e) => {
		e.preventDefault();
		const { user } = this.props;
		const facultyid = user.id;
		// Correct: extract from this.state (not this.setState)
		const { course_name, course_code } = this.state;

		if (!course_code || !course_name) {
			this.setState({ error: "Please fill in all fields." });
			return;
		}

		try {
			const response = await fetch(
				"https://attendease-e5bz.onrender.com/api/course/register",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						facultyid,
						course_name,
						course_code,
					}),
				}
			);
			const data = await response.json();
			if (!response.ok) {
				this.setState({
					error: data.error || "Registration failed",
					message: "",
				});
			} else {
				this.setState({
					message: data.message,
					error: "",
					course_name: "",
					course_code: "",
					showSuccess: true,
				});
				// Hide success message after 2 seconds
				setTimeout(() => {
					this.setState({ showSuccess: false });
				}, 2000);
			}
		} catch (err) {
			console.error("Error during registration:", err);
			this.setState({
				error: "An error occurred during registration",
				message: "",
			});
		}
	};

	render() {
		const { course_name, course_code, message, error, showSuccess } =
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
						Register Course
					</h1>
					{showSuccess && <SuccessNotification message={message} />}
					{error && <div className="error-message">{error}</div>}
					<form
						className="manage-course-form-input-div"
						style={{ marginTop: "50px" }}
						onSubmit={this.handleSubmit}
					>
						<div className="manage-course-form-row">
							<label className="manage-course-form-label">
								Course Code:
							</label>
							<input
								className="manage-course-form-input"
								type="text"
								name="course_code"
								value={course_code}
								placeholder="ex. BMEE301L"
								onChange={this.handleChange}
							/>
						</div>
						<div className="manage-course-form-row">
							<label className="manage-course-form-label">
								Course Name :
							</label>
							<input
								className="manage-course-form-input"
								type="text"
								name="course_name"
								value={course_name}
								placeholder="ex. Thermodynamics"
								onChange={this.handleChange}
							/>
						</div>
						<div className="manage-course-form-submit-div">
							<button
								className="manage-course-submit-btn"
								type="submit"
							>
								Submit
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	currentPage: state.page.currentPage,
	user: state.auth.user,
});

export default connect(mapStateToProps)(RegisterCoursePage);
