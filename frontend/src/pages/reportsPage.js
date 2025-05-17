import React, { Component } from "react";
import { connect } from "react-redux";
import "../pagesStyles/reportsPage.css";

export class ReportsPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			courses: [],
			studentsData: {},
			expandedCourse: null,
			loading: true,
			error: null,
		};
	}

	fetchCourses = () => {
		const { user } = this.props;

		if (!user || !user.id) {
			this.setState({
				error: { message: "Faculty ID not available" },
				loading: false,
			});
			return;
		}

		const facultyid = user.id;
		const url = `http://localhost:5000//api/courses?facultyid=${facultyid}`;

		fetch(url)
			.then((response) => {
				if (!response.ok) throw new Error("Network response not ok");
				return response.json();
			})
			.then((data) => this.setState({ courses: data, loading: false }))
			.catch((error) => this.setState({ error, loading: false }));
	};

	fetchStudentsForCourse = (courseId) => {
		if (this.state.studentsData[courseId]) return; // Skip if data already fetched

		const url = `http://localhost:5000//api/students?courseId=${courseId}`;

		fetch(url)
			.then((response) => {
				if (!response.ok) throw new Error("Failed to fetch students");
				return response.json();
			})
			.then((data) => {
				this.setState((prevState) => ({
					studentsData: {
						...prevState.studentsData,
						[courseId]: data,
					},
				}));
			})
			.catch((error) => console.error("Error fetching students:", error));
	};

	componentDidMount() {
		this.fetchCourses();
	}

	toggleExpand = (courseId) => {
		this.setState((prevState) => ({
			expandedCourse:
				prevState.expandedCourse === courseId ? null : courseId,
		}));

		if (this.state.expandedCourse !== courseId) {
			this.fetchStudentsForCourse(courseId);
		}
	};

	render() {
		const { courses, loading, error, expandedCourse, studentsData } =
			this.state;

		return (
			<div
				className="home-page"
				style={{
					backgroundImage: "url('/assets/home_background.jpg')",
					position: "absolute",
				}}
			>
				<h1 className="reportsHeading">Attendance Report</h1>

				{loading && <p>Loading courses...</p>}
				{error && <p>Error: {error.message}</p>}

				{!loading && !error && courses.length > 0 ? (
					<table className="reportsTable">
						<thead>
							<tr>
								<th className="reportsTableHeader">
									Course ID
								</th>
								<th className="reportsTableHeader">
									Course Name
								</th>
								<th className="reportsTableHeader">
									Course Code
								</th>
								<th
									className="reportsTableHeader"
									style={{ paddingLeft: "25px" }}
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{courses.map((course) => (
								<React.Fragment key={course.course_id}>
									{/* Main Course Row */}
									<tr
										className="courseRow"
										style={{
											backgroundColor:
												expandedCourse ===
												course.course_id
													? "rgba(255,255,255,0.1)"
													: "transparent",
										}}
										onClick={() =>
											this.toggleExpand(course.course_id)
										}
									>
										<td>{course.course_id}</td>
										<td
											style={{
												textAlign: "left",
												marginLeft: "20px",
											}}
										>
											{course.course_name}
										</td>
										<td>{course.course_code}</td>
										<td
											style={{
												fontWeight: "100",
												fontSize: "small",
											}}
										>
											{expandedCourse === course.course_id
												? "▲ Collapse"
												: "▼ Expand"}
										</td>
									</tr>

									{/* Expandable Student Data Row */}
									{expandedCourse === course.course_id && (
										<tr className="expandedRow">
											<td colSpan="4">
												{studentsData[
													course.course_id
												] ? (
													<table className="studentTable">
														<thead
															style={{
																padding: "10px",
															}}
														>
															<tr>
																<th
																	style={{
																		padding:
																			"20px 0px 20px 35px",
																		width: "30%",
																	}}
																>
																	Student ID
																</th>
																<th
																	style={{
																		paddingLeft:
																			"5px",
																		width: "25%",
																	}}
																>
																	Student Name
																</th>
																<th
																	style={{
																		paddingLeft:
																			"5px",
																		width: "25%",
																	}}
																>
																	Attendance
																	(%)
																</th>
															</tr>
														</thead>
														<tbody>
															{studentsData[
																course.course_id
															].length > 0 ? (
																studentsData[
																	course
																		.course_id
																].map(
																	(
																		student
																	) => (
																		<tr
																			key={
																				student.student_id
																			}
																		>
																			<td
																				className="reportStudentRow"
																				style={{
																					paddingLeft:
																						"35px",
																				}}
																			>
																				{
																					student.student_id
																				}
																			</td>
																			<td className="reportStudentRow">
																				{student.fname +
																					" " +
																					student.lname}
																			</td>
																			<td className="reportStudentRow">
																				{
																					student.attendance_percent
																				}

																				%
																			</td>
																		</tr>
																	)
																)
															) : (
																<tr>
																	<td colSpan="3">
																		No
																		students
																		enrolled
																		in this
																		course.
																	</td>
																</tr>
															)}
														</tbody>
													</table>
												) : (
													<p>Loading students...</p>
												)}
											</td>
										</tr>
									)}
								</React.Fragment>
							))}
							<tr className="final-padding-row">
								<td colSpan="4"></td>
							</tr>
						</tbody>
					</table>
				) : (
					<p>No courses found.</p>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
});

export default connect(mapStateToProps)(ReportsPage);
