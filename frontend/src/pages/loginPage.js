import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import '../pagesStyles/loginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    if (id === 'emailInput') setEmailInput(value);
    if (id === 'passwordInput') setPasswordInput(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://attendease-e5bz.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      dispatch(loginSuccess(data));
    } catch (err) {
      console.error('Error:', err);
      alert('Invalid credentials');
    }
  };

  const handleRegister = () => {
    navigate('/registeruser'); // Redirect to the Register User page
  };

  return (
    <div className='login-page'>
      <div className='logo-container'>
        <img
          src="/assets/logo1.jpeg"
          alt="Profile"
          className="logo-image"
        />
        <p className='logo-text'>AttendEase - Smart Attendance</p>
      </div>
      <div className="login-container">
        <form>
          <div className="form-cluster">
            <div className='email-box'>
              <label htmlFor="emailInput">Email address</label>
              <input
                id='emailInput'
                type="email"
                className="form-control"
                aria-describedby="emailHelp"
                placeholder="Enter email"
                onChange={handleInputChange}
                style={{backgroundColor: "rgba(0,0,0,0.4)", color: "white", border: "none"}}
              />
            </div>
            <small
              id="emailHelp"
              style={{ color: 'rgba(0,0,0,0.5' }}
              className="form-text"
            >
              We'll never share your email with anyone else.
            </small>
          </div>
          <div className="pass-group">
            <label htmlFor="passwordInput">Password</label>
            <input
              id='passwordInput'
              type="password"
              className="form-control"
              placeholder="Password"
              onChange={handleInputChange}
              style={{backgroundColor: "rgba(0,0,0,0.4)", color: "white", border: "none"}}
            />
          </div>
          <div className='register-box'>
            New User?
            <button
              className='registerbtn'
              type='button'
              onClick={handleRegister}
            >
              Register user
            </button>
          </div>




          <div style={{ textAlign: 'center' }}>
            <button
              className='submitbtn'
              type="submit"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;