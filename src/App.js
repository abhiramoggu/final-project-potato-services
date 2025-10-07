import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Profile from './components/Profile';
import CreatePost from './components/CreatePost';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(sessionStorage.getItem('currentUser')) || null;
  });
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://192.168.0.1:4000/api/posts')
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the posts!', error);
      });

    axios.get('http://10.0.232.97:4000/api/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the users!', error);
      });
  }, []);

  useEffect(() => {
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home posts={posts} setPosts={setPosts} currentUser={currentUser} users={users} />} />
        <Route path="/profile/:username" element={<Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
        <Route path="/create-post" element={<CreatePost posts={posts} setPosts={setPosts} currentUser={currentUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
