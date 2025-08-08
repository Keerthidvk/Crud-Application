import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [passwordError, setPasswordError] = useState('');
  const [emailError,setEmailError] =useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      validatePassword(value);
    }
    if (name === 'email'){
      validateEmail(value);
    }
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      );
    } else {
      setPasswordError('');
    }
  };
  const validateEmail =(email)=>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(
        'Invalid Email.'
      );
    } else {
      setEmailError('');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError) {
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/register', formData);
      navigate('/');
    } catch (err) {
      alert('Registration failed');
    }
  };
  const goLog =()=>{
    navigate('/');
  };
  const goSign =()=>{
    navigate('/register');
  };
  return (<div>
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      {emailError && <p className="error">{emailError}</p>}
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />
      {passwordError && <p className="error">{passwordError}</p>}
      <select name="role" onChange={handleChange}>
        <option value="user">User</option>
        <option value="manager">Manager</option>
      </select>

      <button type="submit">Register</button>
      <p className='rout'>
        Do you have an account? <Link to="/" className="reg-rout">Login</Link>
      </p>
    </form>
    <div className='logSignBut'>
    <button className='login-but' onClick={goLog}>Login</button> 
    <button className='signup-but'onClick={goSign}>Signup</button>
     </div>
    </div>
  );
};

export default Register;
