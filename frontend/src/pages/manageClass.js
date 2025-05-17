import React, { Component } from "react";
import { connect } from "react-redux";
import "../pagesStyles/manageClass.css";

export class ManageClassPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			courses: [],
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
		const url = `https://attendease-7wry.onrender.com/api/courses?facultyid=${facultyid}`;

		fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response not ok");
				}
				return response.json();
			})
			.then((data) => this.setState({ courses: data, loading: false }))
			.catch((error) => this.setState({ error, loading: false }));
	};

	componentDidMount() {
		this.fetchCourses();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.user !== this.props.user) {
			this.fetchCourses();
		}
	}

	render() {
		const { courses, loading, error } = this.state;

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
				<h1 className="manageHeading">Manage Class</h1>

				{loading && <p>Loading courses...</p>}
				{error && <p>Error: {error.message}</p>}

				{!loading && !error && courses.length > 0 ? (
					<table className="manageTable">
						<thead>
							<tr>
								<th className="manageTableHeader">Course ID</th>
								<th className="manageTableHeader">
									Course Name
								</th>
								<th className="manageTableHeader">
									Course Code
								</th>
							</tr>
						</thead>
						<tbody>
							{courses.map((course) => (
								<tr key={course.course_id}>
									<td className="manageTableRow">
										{course.course_id}
									</td>
									<td className="manageTableRow">
										{course.course_name}
									</td>
									<td className="manageTableRow">
										{course.course_code}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : !loading && !error && courses.length === 0 ? (
					<p>No courses found for this faculty.</p>
				) : null}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
});

export default connect(mapStateToProps)(ManageClassPage);
