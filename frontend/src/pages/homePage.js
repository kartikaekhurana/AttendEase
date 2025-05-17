import React from 'react';
import "../pagesStyles/homePage.css"
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { setCurrentPage } from '../redux/pageSlice';

const HomePage = ({user}) => {
    
  const handleCardClick = (page) =>{
    setCurrentPage(page);
  }
    return (
      <div
	      className='home-page'
        style={{
          backgroundImage: "url('/assets/home_background.jpg')",
          position: "absolute"
        }}
      >
        <div className='contentContainer'>
        <h1 className = "homeHeadingH1">Welcome to Smart Attendance System</h1>
        {user ? (
          <div className="user-info">
            <h2 className="userInfo">
              Prof. {user.fname} {user.lname}
            </h2>
            <p className='desc'>
              Your new tool to make taking attendance an easier and hassle-free affair.
            </p>
          </div>
        ) : (
          <p className="homeHeadingH1">No user information available. Please log in.</p>
        )}
        </div>

        <nav>
          <div className='cardContainer'>
            <NavLink
                      to="/attendance"
                      className="link"
                      onClick={() => handleCardClick('attendance')}
                    >
                    <div className = "homePageCard">
                    <h3>Record Attendance</h3>
                    </div>
            </NavLink>
            <NavLink
                      to="/manageclass"
                      className="link"
                      onClick={() => handleCardClick('attendance')}
                    >
                    <div className = "homePageCard">
                    <h3>Manage Classes</h3>
                    </div>
            </NavLink>
            <NavLink
                      to="/reports"
                      className="link"
                      onClick={() => handleCardClick('attendance')}
                    >
                    <div className = "homePageCard">
                    <h3>Register</h3>
                    </div>
            </NavLink>
            <NavLink
                      to="/attendance"
                      className="link"
                      onClick={() => handleCardClick('attendance')}
                    >
                    <div className = "homePageCard">
                    <h3>Reports</h3>
                    </div>
            </NavLink>
            <NavLink
                      to="/profile"
                      className="link"
                      onClick={() => handleCardClick('attendance')}
                    >
                    <div className = "homePageCard">
                    <h3>Profile</h3>
                    </div>
            </NavLink>
          </div>
        </nav>
      </div>
    );
  }

const mapStateToProps = (state) => ({
  user: state.auth.user,
})

const mapDispatchToProps = {
  setCurrentPage,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
