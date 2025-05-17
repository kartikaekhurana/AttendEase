import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { connect } from "react-redux";

import "./App.css";

import LoginPage from "./pages/loginPage";
import HomePage from "./pages/homePage";
import AttendancePage from "./pages/attendancePage";
import ManageClassPage from "./pages/manageClass";
import ReportsPage from "./pages/reportsPage";
import RegisterStudentPage from "./pages/registerStudentPage";
import RegisterCoursePage from "./pages/registerCoursePage";
import LinkStudentCoursePage from "./pages/linkStudentCoursePage";
import ProfilePage from "./pages/profilePage";

import Navbar from "./pages/components/Navbar";
import RegisterPage from "./pages/registerPage";

function App({ isAuthenticated }) {
	return (
		<Router>
			<div>
				{isAuthenticated && <Navbar className="navbar" />}
				<Routes>
					<Route	path="/login"
						element={
							!isAuthenticated ? (
								<LoginPage />
							) : (
								<Navigate to="/home" />
							)
						}
					/>
					<Route
						path="/registeruser"
						element={
							!isAuthenticated ? (
								<RegisterPage />
							) : (
								<Navigate to="/home" />
							)
						}
					/>
					<Route
						path="/home"
						element={
							isAuthenticated ? (
								<HomePage />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/attendance"
						element={
							isAuthenticated ? (
								<AttendancePage />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/manageclass"
						element={
							isAuthenticated ? (
								<ManageClassPage />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/reports"
						element={
							isAuthenticated ? (
								<ReportsPage />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/profile"
						element={
							isAuthenticated ? (
								<ProfilePage />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/settings/registerstudent"
						element={
							isAuthenticated ? (
								<RegisterStudentPage />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/settings/registercourse"
						element={
							isAuthenticated ? (
								<RegisterCoursePage />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="/settings/linkstudent"
						element={
							isAuthenticated ? (
								<LinkStudentCoursePage />
							) : (
								<Navigate to="/login" />
							)
						}
					/>
					<Route
						path="*"
						element={
							<Navigate
								to={isAuthenticated ? "/home" : "/login"}
							/>
						}
					/>
				</Routes>
			</div>
		</Router>
	);
}

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(App);
