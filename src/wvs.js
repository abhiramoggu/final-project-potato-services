import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import logo from './logo512.png'; // Import the logo image

function Signup() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = () => {
    const newUser = { name, username, contact, location, password };
    axios.post('http://192.168.0.196:4000/api/register', newUser)
      .then(response => {
        alert('User registered successfully');
        navigate('/');
      })
      .catch(error => {
        console.error('There was an error registering the user!', error);
      });
  };

  return (
    <div className="signup-container">
      <div className="header">
        <img src={logo} alt="Potato Services Logo" className="logo" />
        <h1>Potato Services</h1>
      </div>
      <h2>Sign Up</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Contact"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleSignup}
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
        Sign Up
      </button>
      <p>
        Already have an account? <Link to="/">Log in</Link>
      </p>
    </div>
  );
}

export default Signup;
