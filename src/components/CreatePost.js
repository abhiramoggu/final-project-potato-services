import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from './logo512.png'; // Import the logo image
import './CreatePost.css';

const DEFAULT_PROFILE_PICTURE = '/default-profile.png'; // Path to the default profile picture

function CreatePost({ posts, setPosts, currentUser }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleConfirmPost = () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', currentUser ? currentUser.name : 'Anonymous');
    formData.append('category', category);
    formData.append('link', link);
    formData.append('location', location);
    if (image) {
      formData.append('image', image);
    }

    axios.post('http://192.168.0.10:4000/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        const newPost = {
          id: response.data.id,
          title,
          content,
          author: currentUser ? currentUser.name : 'Anonymous',
          category,
          image: image ? URL.createObjectURL(image) : null,
          link,
          location,
          timestamp: new Date().toLocaleString(),
          likes: 0,
          reports: 0,
          comments: [],
          profilePicture: currentUser ? currentUser.profilePicture : DEFAULT_PROFILE_PICTURE
        };
        setPosts([newPost, ...posts]);
        alert('Post created successfully');
        navigate('/home');
      })
      .catch(error => {
        console.error('There was an error creating the post!', error);
      });
  };

  return (
    <div className="create-post-container">
      <div className="create-post-sidebar">
        <div className="header">
          <img src={logo} alt="Logo" className="logo" />
          <h1>Potato Services</h1>
        </div>
        <h2>@{currentUser ? currentUser.username : 'Anonymous'}</h2>
        <p>{currentUser ? currentUser.name : 'Guest'}</p>
        <Link to="/home">Home</Link>
        {currentUser && <Link to={`/profile/${currentUser.username}`}>Profile</Link>}
        <Link to="/create-post">Create Post</Link>
      </div>
      <div className="create-post-main-content">
        <h2>Create Post</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select Category</option>
          <option value="Community Service">Community Service</option>
          <option value="Environmental Initiatives">Environmental Initiatives</option>
          <option value="Educational Programs">Educational Programs</option>
          <option value="Health and Wellness">Health and Wellness</option>
          <option value="Animal Welfare">Animal Welfare</option>
          <option value="Fundraising Events">Fundraising Events</option>
          <option value="Youth Engagement">Youth Engagement</option>
          <option value="Senior Support">Senior Support</option>
          <option value="Emergency Response">Emergency Response</option>
          <option value="Cultural Exchange">Cultural Exchange</option>
          <option value="Donation Drives">Donation Drives</option>
        </select>
        <input
          type="text"
          placeholder="Link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (Google Maps Embed Code)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <div className="file-input-container">
          <label htmlFor="fileInput" className="file-input-label">Choose File</label>
          <input
            type="file"
            id="fileInput"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button
          onClick={handleConfirmPost}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#3c3c3c',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Confirm Post
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
