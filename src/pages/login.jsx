import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
      const { token, role, is_active } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (!is_active) {
        setShowSuccess(true);
        setTimeout(() => {
          if (role === 'manager') {
            navigate('/dashboard');
          } else {
            navigate('/profile', { state: { email } });
          }
        }, 2000);
      }

    } catch (err) {
      if (err.response && err.response.status === 403) {
        setErrorMsg('Your account has been deactivated. Please contact the admin.');
      } else {
        setErrorMsg('Invalid email or password. Please try again.');
      }
    }
  };

  const goLog = () => navigate('/');
  const goSign = () => navigate('/register');

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-container">
        <h1 className="title">Skill Sync</h1>
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Welcome Back 👋</h2>
           {/* <p>student : hello@gmail.com  - Hello@123</p>
          <p>faculty: jemi@gmail.com - Jemi@123</p> */}
          <p className="subtitle">Login to continue your journey</p>

          <input
            type="email"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && <p className="error">{errorMsg}</p>}

          <button type="submit" className="login-btn">Login</button>

          <p className="rout">
            Don’t have an account?{' '}
            <Link to="/register" className="reg-rout">Register</Link>
          </p>
        </form>

        {showSuccess && (
          <div className="success-poster">
            <div className="poster-content">
              <h3>Login Successful ✅</h3>
              <p>Redirecting...</p>
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

export default Login;
