import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import logo from './logo512.png'; // Import the logo image
import './Profile.css'; // Import the CSS file

const DEFAULT_PROFILE_PICTURE = '/default-profile.png'; // Path to the default profile picture

function Profile({ currentUser, setCurrentUser }) {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [editPostId, setEditPostId] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [bannerMessage, setBannerMessage] = useState('');

  useEffect(() => {
    if (!username || !currentUser) {
      console.error('Username or currentUser is missing');
      return;
    }

    axios.get(`http://192.168.0.10:4000/api/users/${username}`)
      .then(response => {
        setProfile(response.data);
        setProfilePicture(response.data.profilePicture);
      })
      .catch(error => {
        console.error('There was an error fetching the profile!', error);
      });

    // Fetch user's posts
    fetchUserPosts(currentUser.name);

    // Fetch user's applications
    fetchUserApplications(currentUser.name);
  }, [username, currentUser]);

  const fetchUserPosts = (authorName) => {
    axios.get(`http://192.168.0.10:4000/api/posts`)
      .then(response => {
        const userPosts = response.data.filter(post => post.author === authorName);
        setPosts(userPosts);
      })
      .catch(error => {
        console.error('There was an error fetching the posts!', error);
      });
  };

  const fetchUserApplications = (authorName) => {
    axios.get(`http://192.168.0.10:4000/api/applications?author=${authorName}`)
      .then(response => {
        setApplications(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the applications!', error);
      });
  };

  const handleSaveProfile = () => {
    if (!profilePicture || !(profilePicture instanceof File)) {
      setBannerMessage('Please upload a new profile picture.');
      return;
    }

    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('contact', profile.contact);
    formData.append('location', profile.location);
    formData.append('password', profile.password);
    formData.append('profilePicture', profilePicture);

    axios.put(`http://192.168.0.10:4000/api/users/${username}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        const updatedProfile = { ...profile, profilePicture: response.data.profilePicture };
        setCurrentUser(updatedProfile);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        setEditMode(false);
        setBannerMessage('');

        // Refetch user's posts and applications with updated details
        fetchUserPosts(updatedProfile.name);
        fetchUserApplications(updatedProfile.name);
      })
      .catch(error => {
        console.error('There was an error updating the profile!', error);
      });
  };

  const handleEditPost = (post) => {
    setEditPostId(post.id);
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
  };

  const handleSavePost = (id) => {
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });
    axios.put(`http://192.168.0.10:4000/api/posts/${id}`, {
      title: editPostTitle,
      content: editPostContent,
      timestamp
    })
      .then(response => {
        setPosts(posts.map(post => post.id === id ? { ...post, title: editPostTitle, content: editPostContent, timestamp } : post));
        setEditPostId(null);
      })
      .catch(error => {
        console.error('There was an error updating the post!', error);
      });
  };

  const handleDeletePost = (id) => {
    axios.delete(`http://192.168.0.10:4000/api/posts/${id}`)
      .then(response => {
        setPosts(posts.filter(post => post.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the post!', error);
      });
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  const profileImage = profile?.profilePicture ? `http://192.168.0.10:4000${profile.profilePicture}` : DEFAULT_PROFILE_PICTURE;

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
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
      <div className="profile-main-content">
        <h2>Profile Page</h2>
        {bannerMessage && <div className="banner">{bannerMessage}</div>}
        {editMode ? (
          <div>
            <label>
              Profile Picture:
              <input
                type="file"
                onChange={(e) => setProfilePicture(e.target.files[0])}
              />
            </label>
            <img className="profile-picture" src={profilePicture instanceof File ? URL.createObjectURL(profilePicture) : profileImage} alt="Profile" />
            <button onClick={handleSaveProfile}>Save</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        ) : (
          <div>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Contact:</strong> {profile.contact}</p>
            <p><strong>Location:</strong> {profile.location}</p>
            <p><strong>Password:</strong> <input type="password" value={profile.password} readOnly /></p>
            <img className="profile-picture" src={profileImage} alt="Profile" />
            <button onClick={() => setEditMode(true)}>Edit Profile Picture</button>
            <div>
              <h3>Post History</h3>
              {posts.length > 0 ? (
                posts.map(post => (
                  <div key={post.id} className="post">
                    {editPostId === post.id ? (
                      <div>
                        <input
                          type="text"
                          value={editPostTitle}
                          onChange={(e) => setEditPostTitle(e.target.value)}
                        />
                        <textarea
                          value={editPostContent}
                          onChange={(e) => setEditPostContent(e.target.value)}
                        ></textarea>
                        <button onClick={() => handleSavePost(post.id)}>Save</button>
                        <button onClick={() => setEditPostId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div>
                        <h4>{post.title}</h4>
                        <p>{post.content}</p>
                        <p><small>Posted on: {post.timestamp}</small></p>
                        <button onClick={() => handleEditPost(post)}>Edit</button>
                        <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No posts available.</p>
              )}
            </div>
            <div>
              <h3>Applications</h3>
              {applications.length > 0 ? (
                applications.map(application => (
                  <div key={application.id} className="post">
                    <p><strong>Post:</strong> {application.postTitle}</p>
                    <p><strong>Name:</strong> {application.name}</p>
                    <p><strong>Nationality:</strong> {application.nationality}</p>
                    <p><strong>Email:</strong> {application.email}</p>
                    <p><strong>Phone:</strong> {application.phone}</p>
                    <p><strong>Description:</strong> {application.description}</p>
                    <p><small>Applied on: {application.timestamp}</small></p>
                  </div>
                ))
              ) : (
                <p>No applications available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
