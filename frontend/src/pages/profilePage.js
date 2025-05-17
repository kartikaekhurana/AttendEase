import React, {useState} from 'react'
import { connect } from 'react-redux'
import "../pagesStyles/profilePage.css"

const ProfilePage = ({user}) =>  {
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState(user);

	const handleChange = (e) =>{
		const {name, value} = e.target;
		setFormData({
			...formData,
			[name] : value,
		})
	}

	const handleEditToggle = () =>{
		setIsEditing(!isEditing);
	}

	const handleSave = async () =>{
		try{
			const response = await fetch('http://localhost:5000//api/profile',
				{
					method : 'PUT',
					headers: {
						'Content-Type' : 'application/json',
					},
					body: JSON.stringify(formData),
				});

				if(response.ok){
					alert('Profile updated successfully!')
					setIsEditing(false)
				}else{
					alert('Failed to update profile. Please try again.')
				}	
		}catch(err){
			console.log('Error updateing profile: ', err)
			alert('An error occured while updating your profile: {err.message')
		}
	}

	return (
	  <div 
	  	className='profile-page'
		  style={{
			backgroundImage: "url('/assets/home_background.jpg')",
			position: "absolute"
		  }}
	  >
		<div className='profile-container'>
			<h2 className='profileHeading'>Faculty Profile Information</h2>
			<div className='labelGroup'>
				<div className='labels'>
					<h5 className='head' style={{marginRight:'90px'}}>
						Name       
					</h5>
					:
					<h5 style={{marginLeft:'30px'}}> 
						{isEditing ? (
							<div>
								<input
								type='text'
								name='fname'
								value={formData.fname}
								onChange={handleChange}
								className='inputField'
								/>
							<input
								type='text'
								name='lname'
								value={formData.lname}
								onChange={handleChange}
								className='inputField'
								/>
							</div>
						) : (
							<span>{formData.fname} {formData.lname}</span>
						)}
					</h5>
				</div>
				<div className='labels'>
					<h5 className='head' style={{marginRight:'50px'}}>
						Faculty Id 
					</h5>
					:
					<h5 style={{marginLeft:'30px'}}> 
						{false ? (
							<input
								type='text'
								name='id'
								value={formData.id}
								onChange={handleChange}
								className='inputField'
								/>
						) : (
							<span>{formData.id}</span>
						)}
					</h5>
				</div>
				<div className='labels'>
					<h5 className='head' style={{marginRight:'66px'}}>
						Email-id   
					</h5>
					:
					<h5 style={{marginLeft:'30px'}}>
					{isEditing ? (
							<input
								type='text'
								name='email'
								value={formData.email}
								onChange={handleChange}
								className='inputField'
								style={{width: '270px'}}
								/>
						) : (
							<span>{formData.email}</span>
						)}
					</h5>
				</div>
				<div className='labels'>
					<h5 className='head' style={{marginRight:'25px'}}>
						Department
					</h5>
					:
					<h5 style={{marginLeft:'30px'}}>
					{isEditing ? (
							<input
								type='text'
								name='dept'
								value={formData.dept}
								onChange={handleChange}
								className='inputField'
								/>
						) : (
							<span>{formData.dept}</span>
						)}
					</h5>
				</div>
				<div className='labels'>
					<h5 className='head' style={{marginRight:'82px'}}>
						Mobile     
					</h5>
					:
					<h5 style={{marginLeft:'30px'}}>
					{isEditing ? (
							<input
								type='text'
								name='mobile'
								value={formData.mobile}
								onChange={handleChange}
								className='inputField'
								/>
						) : (
							<span>{formData.mobile}</span>
						)}
					</h5>
				</div>
				<div className='labels'>
					<h5 className='head' style={{marginRight:'96px'}}>
						Cabin       
					</h5>
					:
					<h5 style={{marginLeft:'30px'}}>
					{isEditing ? (
							<input
								type='text'
								name='cabin'
								value={formData.cabin}
								onChange={handleChange}
								className='inputField'
								/>
						) : (
							<span>{formData.cabin}</span>
						)}
					</h5>
				</div>
			</div>

			<div className='buttonGroup'>
				{!isEditing ? (
					<button 
						onClick={handleEditToggle} 
						className='editButton'>
							Edit
					</button>
				) : (
					<>
					<button 
						onClick={handleSave} 
						className='saveButton'>
							Save
					</button>
					<button 
						onClick={handleEditToggle} 
						className='cancelButton'>
							Cancel
					</button>
					</>
				)}
			</div>

		</div>
	  </div>
	)
  
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
  })


export default connect(mapStateToProps)(ProfilePage);