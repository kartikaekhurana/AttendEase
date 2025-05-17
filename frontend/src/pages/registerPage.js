import React, {useState} from 'react';
import { connect } from 'react-redux';
import '../pagesStyles/registerPage.css';

const RegisterPage = () => {

	const [formData, setFormData] = useState({
		facultyid: '',
		email: '',
		password:'',
		fname: '',
		lname: '',
		dob:'',
		mobile: '',
		role:'Faculty',
		dept: '',
		cabin: '',
	});
	
	const [errors, setErrors] = useState({});
	const [showAlert, setShowAlert] = useState(false);

	const validate = () => {
		const newErrors = {};
	
		// Faculty ID validation
		if (!formData.facultyid) {
			newErrors.facultyid = 'Faculty ID required';
		  } else if (!/^\d{4}$/.test(formData.facultyid)) {
			newErrors.facultyid = 'ID must be 4-digit';
		  }
	
		// Email validation
		if (!formData.email) newErrors.email = 'Email required';
		else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email address';
		
		//Password validation
		if (!formData.password) {
			newErrors.password = 'Password required';
		  } else if (formData.password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters long';
		  } else if (!/[A-Z]/.test(formData.password)) {
			newErrors.password = 'Password must contain at least one uppercase letter';
		  } else if (!/[a-z]/.test(formData.password)) {
			newErrors.password = 'Password must contain at least one lowercase letter';
		  } else if (!/\d/.test(formData.password)) {
			newErrors.password = 'Password must contain at least one digit';
		  }
		
		// Name validation
		if (!formData.fname) newErrors.fname = 'First name required';
		if (!formData.lname) newErrors.lname = 'Last name required';
	
		// Mobile number validation
		if (!formData.mobile) newErrors.mobile = 'Mobile no. required';
		else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile no. must be 10 digits';
	
		// Department validation
		if (!formData.dept) newErrors.dept = 'Department required';
	
		// Cabin validation
		if (!formData.cabin) newErrors.cabin = 'Cabin no. required';

		// Date of Birth validation
		if (!formData.dob) newErrors.dob = 'Date of Birth required';
	
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	  };

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		console.log('hello')
		e.preventDefault();
		if (validate()) {
			try{
				const response = await fetch('http://localhost:5000//api/register',{
					method: 'POST',
					headers: { 'Content-Type' : 'application/json' },
					body : JSON.stringify(formData),
				});
	
				const data = await response.json();
				if(response.ok){
					setShowAlert(true);
					setTimeout(() => {
						setShowAlert(false);
						window.location.href='/login';
					}, 2000);
					setFormData({
						facultyid:'', 
						email:'', 
						password:'', 
						fname:'',
						lname:'', 
						dob:'', 
						mobile:'',
						dept:'',
						cabin:''
					});
				}else{
					alert(`Error: ${data.message}`);
					console.log('Error: ', data.message);
				}
			}catch(err){
				console.log('Error: ', err);
				alert('Failed to register user!');
			}
		}
	  };


  	return (
    	<div
      	className="register-page"
      	style={{
        	backgroundImage: "url('/assets/background_image.jpg')",
	        position: "absolute",
    	  }}
    	>
      	<div className="register-container">
	        <div className="register-heading">Register New User</div>
        	<div className="register-form">
		  
			<div className="register-form-group">
	            <label className="register-form-label">Faculty ID :</label>
            	<div className="register-input-group">
              	<input
	                type="text"
                	name="facultyid"
                	className="register-input"
					value={formData.facultyid}
					onChange={handleChange}
                	placeholder="Faculty ID"
              	/>
            	</div>
          	</div>
			<div className='register-error-div'>
				{errors.facultyid && <p className='register-error-label'>{errors.facultyid}</p>}
			</div>

		  	<div className="register-form-group">
	            <label className="register-form-label">Email:</label>
            	<div className="register-input-group">
              	<input
	                type="email"
                	name="email"
					value={formData.email}
					onChange={handleChange}
                	className="register-input"
                	placeholder="Work Email"
              	/>
            	</div>
          	</div>
			  <div className='register-error-div'>
				{errors.email && <p className='register-error-label'>{errors.email}</p>}
			</div>

		  	<div className="register-form-group">
	            <label className="register-form-label">Password:</label>
            	<div className="register-input-group">
              	<input
	                type="password"
                	name="password"
					value={formData.password}
					onChange={handleChange}
                	className="register-input"
                	placeholder="Password"
              	/>
            	</div>
          	</div>
			<div className='register-error-div'>
				{errors.password && <p className='register-error-label'>{errors.password}</p>}
			</div>

	          <div className="register-form-group">
            	<label className="register-form-label">Name :</label>
            	<div className='register-input-group'>
					<div className="register-name-group">
						<input
							type="text"
							name="fname"
							value={formData.fname}
							onChange={handleChange}
							className="register-fname-input"
							placeholder="First Name"
						/>
						<input
							type="text"
							name="lname"
							value={formData.lname}
							onChange={handleChange}
							className="register-lname-input"
							placeholder="Last Name"
						/>
					</div>
				</div>
          	</div>
			<div className='register-error-div'>
				{errors.fname && <p className='register-error-label'>{errors.fname}</p>}
				{errors.lname && <p className='register-error-label'>{errors.lname}</p>}
			</div>

			  <div className="register-form-group">
            	<label className="register-form-label">Mobile No. :</label>
            	<div className="register-input-group">
              	<input
	                type="text"
                	name="mobile"
					value={formData.mobile}
					onChange={handleChange}
                	className="register-input"
                	placeholder="Mobile Number"
              	/>
            	</div>
          	</div>
			<div className='register-error-div'>
				{errors.mobile && <p className='register-error-label'>{errors.mobile}</p>}
			</div>

			<div className="register-form-group">
				<label className="register-form-label">Date of Birth :</label>
				<div className="register-input-group">
				<input
					type="date"
					name="dob"
					value={formData.dob}
					onChange={handleChange}
					className="register-input"
				/>
				</div>
			</div>
			<div className="register-error-div">
				{errors.dob && <p className="register-error-label">{errors.dob}</p>}
			</div>

			  <div className="register-form-group">
            	<label className="register-form-label">Department :</label>
            	<div className="register-input-group">
              	<input
	                type="text"
                	name="dept"
					value={formData.dept}
					onChange={handleChange}
                	className="register-input"
                	placeholder="Department"
              	/>
            	</div>
          	</div>
			<div className='register-error-div'>
				{errors.dept && <p className='register-error-label'>{errors.dept}</p>}
			</div>
		  
			<div className="register-form-group">
            	<label className="register-form-label">Cabin :</label>
            	<div className="register-input-group">
              	<input
	                type="text"
                	name="cabin"
					value={formData.cabin}
					onChange={handleChange}
                	className="register-input"
                	placeholder="Cabin Number"
              	/>
            	</div>
          	</div>
			<div className='register-error-div'>
				{errors.cabin && <p className='register-error-label'>{errors.cabin}</p>}
			</div>

        	</div>

			<div>
		  		<button type='submit' 
					className='register-btn'
		  			onClick={handleSubmit}
				>
					Register
				</button>
			</div>

			{showAlert &&(
				<div className='custom-alert'>
					<p>User Registered Successfully!</p>
				</div>
			)}
      	</div>
    	</div>
  	);
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(RegisterPage);