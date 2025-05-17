import React from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { setCurrentPage } from "../../redux/pageSlice";
import { logout } from "../../redux/authSlice";
import "./Navbar.css";

const Navbar = ({ currentPage, setCurrentPage, logout, user }) => {
  const handleNavClick = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink
          to="/home"
          className={({ isActive }) => (isActive ? "active-link" : "link")}
          onClick={() => handleNavClick("Home")}
        >
          Home
        </NavLink>
        <NavLink
          to="/attendance"
          className={({ isActive }) => (isActive ? "active-link" : "link")}
          onClick={() => handleNavClick("attendance")}
        >
          Attendance
        </NavLink>
        <NavLink
          to="/manageclass"
          className={({ isActive }) => (isActive ? "active-link" : "link")}
          onClick={() => handleNavClick("manageclass")}
        >
          Manage Class
        </NavLink>
        {/* Dropdown for Settings */}
        <div className="dropdown">
          <button className="dropbtn" onClick={() => handleNavClick("settings")}>
            Register
          </button>
          <div className="dropdown-content">
            <NavLink
              to="/settings/registerstudent"
              className="link"
            >
              Register Student
            </NavLink>
            <NavLink
              to="/settings/registercourse"
              className="link"
            >
              Register Course
            </NavLink>
            <NavLink
              to="/settings/linkstudent"
              className="link"
            >
              Link Student to Course
            </NavLink>
          </div>
        </div>
        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? "active-link" : "link")}
          onClick={() => handleNavClick("reports")}
        >
          Reports
        </NavLink>
      </div>
      <div className="navbar-right">
        <button className="logoutBtn" onClick={handleLogout}>
          Logout
        </button>
        <div className="profileDiv">
          <NavLink
            to="/profile"
            className="link"
            onClick={() => handleNavClick("profile")}
          >
            <div className="profile-icon">
              <img
                src="/assets/profile_pfp.png"
                alt="Profile"
                className="profile-image"
              />
            </div>
            <div style={{ marginTop: "4px" }}>{user.fname}</div>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

const mapStateToProps = (state) => ({
  currentPage: state.page.currentPage,
  user: state.auth.user,
});

const mapDispatchToProps = {
  setCurrentPage,
  logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
