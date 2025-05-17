import React, { Component } from "react";
import "../pagesStyles/registerStudentPage.css";

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

export class RegisterStudentPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			student_id: "",
			fname: "",
			lname: "",
			email: "",
			message: "",
			error: "",
			showSuccess: false,
		};
	}

	// Handle input changes and update state
	handleChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	// Handle form submission
	handleSubmit = async (e) => {
		e.preventDefault();
		const { student_id, fname, lname, email } = this.state;
		// Validate that all fields are filled
		if (!student_id || !fname || !lname || !email) {
			this.setState({ error: "Please fill in all fields", message: "" });
			return;
		}

		try {
			const response = await fetch(
				"https://attendease-7wry.onrender.com/api/students/register",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ student_id, fname, lname, email }),
				}
			);
			const data = await response.json();
			if (!response.ok) {
				this.setState({
					error: data.error || "Registration failed",
					message: "",
				});
			} else {
				// Show success notification and clear the form
				this.setState({
					message: data.message,
					error: "",
					student_id: "",
					fname: "",
					lname: "",
					email: "",
					showSuccess: true,
				});
				// Hide the success message after 2 seconds
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
		const { student_id, fname, lname, email, message, error, showSuccess } =
			this.state;
		return (
			<div
				className="settings-page"
				style={{
					backgroundImage: "url('/assets/home_background.jpg')",
					position: "absolute",
				}}
			>
				<div className="manage-student-form-div">
					<h1 className="manage-student-form-title">
						Register Student
					</h1>
					{/* Display the custom success component if registration succeeded */}
					{showSuccess && <SuccessNotification message={message} />}
					{error && <div className="error-message">{error}</div>}
					<form
						className="manage-student-form-input-div"
						style={{ marginTop: "50px" }}
						onSubmit={this.handleSubmit}
					>
						<div className="manage-student-form-row">
							<label>Registration No.:</label>
							<input
								className="manage-student-form-input"
								type="text"
								name="student_id"
								value={student_id}
								placeholder="ex. 21BIT0387"
								onChange={this.handleChange}
							/>
						</div>
						<div className="manage-student-form-row">
							<label>First Name :</label>
							<input
								className="manage-student-form-input"
								type="text"
								name="fname"
								value={fname}
								placeholder="ex. John"
								onChange={this.handleChange}
							/>
						</div>
						<div className="manage-student-form-row">
							<label>Last Name :</label>
							<input
								className="manage-student-form-input"
								type="text"
								name="lname"
								value={lname}
								placeholder="ex. Doe"
								onChange={this.handleChange}
							/>
						</div>
						<div className="manage-student-form-row">
							<label>Email-id :</label>
							<input
								className="manage-student-form-input"
								type="email"
								name="email"
								value={email}
								placeholder="ex. johndoe123@college.com"
								onChange={this.handleChange}
							/>
						</div>
						<div className="manage-student-form-submit-div">
							<button
								className="manage-student-submit-btn"
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

export default RegisterStudentPage;
