import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') validatePassword(value);
    if (name === 'email') validateEmail(value);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
      );
    } else {
      setPasswordError('');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid Email Address.');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError || emailError) return;

    try {
      await axios.post('http://localhost:5000/api/register', formData);
      setShowSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      alert('Registration failed. Please try again.');
    }
  };

  const goLog = () => navigate('/');
  const goSign = () => navigate('/register');

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-container">
        <h1 className="title">Skill Sync</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create Account 📝</h2>
          <p className="subtitle">Join Skill Sync to continue learning</p>

          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
          />
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
            <option value="user">Student</option>
            <option value="manager">Faculty</option>
          </select>

          <button type="submit" className="login-btn">Register</button>

          <p className="rout">
            Already have an account?{' '}
            <Link to="/" className="reg-rout">Login</Link>
          </p>
        </form>

        {showSuccess && (
          <div className="success-poster">
            <div className="poster-content">
              <h3>Registration Successful 🎉</h3>
              <p>Redirecting to Login...</p>
            </div>
          </div>
        )}

        <div className="logSignBut">
          <button className="login-but" onClick={goLog}>Login</button>
          <button className="signup-but" onClick={goSign}>Signup</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
