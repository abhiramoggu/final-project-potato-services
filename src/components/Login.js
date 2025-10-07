import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import logo from './logo512.png'; // Ensure this path is correct

function Login({ setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    axios.post('http://192.168.0.10:4000/api/login', { username, password })
      .then(response => {
        setCurrentUser(response.data);
        sessionStorage.setItem('currentUser', JSON.stringify(response.data));
        navigate('/home');
      })
      .catch(error => {
        console.error('There was an error logging in!', error);
        alert('Invalid username or password');
      });
  };

  return (
    <div className="login-container">
      <div className="header">
        <img src={logo} alt="Potato Services Logo" className="logo" />
        <h1>Potato Services</h1>
      </div>
      <div className="login-box">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#3c3c3c',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Login
        </button>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
