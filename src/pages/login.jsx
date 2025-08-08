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
      setErrorMsg(''); // Clear previous errors
    
      try {
        const res = await axios.post('http://localhost:5000/api/login', { email, password });
        const { token, role, is_active,} = res.data;
      
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
      
        if (!is_active) {
          setShowSuccess(true); // show the success poster
        
          setTimeout(() => {
            if (role === 'manager') {
              navigate('/dashboard');
            } else {
              navigate('/profile', { state: { email } });
            }
          }, 2000); // wait 2 seconds before redirecting
        }
        
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setErrorMsg('Your account has been deactivated. Please contact the admin.');
        } else {
          setErrorMsg('Invalid email or password. Please try again.');
        }
      }};
      const goLog =()=>{
        navigate('/');
      };
      const goSign =()=>{
        navigate('/register');
      };

  return (
    <div>
    <form className="auth-form" onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
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

      <button type="submit">Login</button>
      <p className="rout">
        If you don't have an account,{' '}
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
)}  <div className='logSignBut'>
<button className='login-but' onClick={goLog}>Login</button> 
<button className='signup-but'onClick={goSign}>Signup</button>
 </div>
    </div>
  );
};

export default Login;
