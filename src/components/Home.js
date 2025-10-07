import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import './Home.css';
import logo from './logo512.png'; // Make sure to update this path to the correct one

function Home({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState({});
  const [sortedPosts, setSortedPosts] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: '',
    nationality: '',
    email: '',
    phone: '',
    description: ''
  });
  const [currentPostId, setCurrentPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentUser]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://192.168.0.10:4000/api/posts', {
        params: {
          title: searchQuery,
          category: searchCategory
        }
      });
      setPosts(response.data);
      setSortedPosts(response.data);
    } catch (error) {
      console.error('There was an error fetching the posts!', error);
    }
  };

  const handleLike = (id) => {
    axios.post(`http://192.168.0.10:4000/api/posts/${id}/toggle-like`, { userId: currentUser.id })
      .then(response => {
        const updatedPosts = posts.map(post =>
          post.id === id ? { ...post, likes: response.data.likes } : post
        );
        setPosts(updatedPosts);
        setSortedPosts(updatedPosts);
      })
      .catch(error => {
        console.error('There was an error toggling the like!', error);
      });
  };

  const handleReport = (id) => {
    axios.post(`http://192.168.0.10:4000/api/posts/${id}/toggle-report`, { userId: currentUser.id })
      .then(response => {
        const updatedPosts = posts.map(post =>
          post.id === id ? { ...post, reports: response.data.reports } : post
        );
        setPosts(updatedPosts);
        setSortedPosts(updatedPosts);
      })
      .catch(error => {
        console.error('There was an error toggling the report!', error);
      });
  };

  const handleComment = (id) => {
    const newComment = {
      text: comment,
      author: currentUser ? currentUser.name : 'Anonymous',
      profilePicture: currentUser ? currentUser.profilePicture : null,
      timestamp: new Date().toLocaleString()
    };
    axios.post(`http://192.168.0.10:4000/api/posts/${id}/comment`, newComment)
      .then(response => {
        const updatedComments = comments[id] ? [newComment, ...comments[id]] : [newComment];
        setComments({ ...comments, [id]: updatedComments });
        setComment('');
      })
      .catch(error => {
        console.error('There was an error adding the comment!', error);
      });
  };

  const toggleComments = (id) => {
    if (expandedPostId === id) {
      setExpandedPostId(null);
    } else {
      axios.get(`http://192.168.0.10:4000/api/posts/${id}/comments`)
        .then(response => {
          setComments({ ...comments, [id]: response.data });
          setExpandedPostId(id);
        })
        .catch(error => {
          console.error('There was an error fetching the comments!', error);
        });
    }
  };

  const sortPostsByDate = (ascending = true) => {
    const sorted = [...sortedPosts].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return ascending ? dateA - dateB : dateB - dateA;
    });
    setSortedPosts(sorted);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'http://192.168.0.10:3000/';
  };

  const filteredPosts = sortedPosts.filter(post =>
    (post.title ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) : false) &&
    (searchCategory === '' || (post.category ? post.category.toLowerCase() === searchCategory.toLowerCase() : false))
  );

  const handleApply = (postId) => {
    setCurrentPostId(postId);
    setShowApplyModal(true);
  };

  const handleApplyChange = (e) => {
    setApplyForm({ ...applyForm, [e.target.name]: e.target.value });
  };

  const handleApplySubmit = () => {
    axios.post(`http://192.168.0.10:4000/api/posts/${currentPostId}/apply`, {
      ...applyForm,
      userId: currentUser.id,
      postId: currentPostId
    })
      .then(response => {
        alert('Application submitted successfully');
        setShowApplyModal(false);
        setApplyForm({
          name: '',
          nationality: '',
          email: '',
          phone: '',
          description: ''
        });
      })
      .catch(error => {
        console.error('There was an error submitting the application!', error);
      });
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="header">
          <img src={logo} alt="Logo" className="logo" />
          <h1>Potato Services</h1>
        </div>
        <h2>@{currentUser ? currentUser.username : 'Guest'}</h2>
        <p>{currentUser ? currentUser.name : 'Guest'}</p>
        <Link to="/home">Home</Link>
        {currentUser && <Link to={`/profile/${currentUser.username}`}>Profile</Link>}
        <Link to="/create-post">Create Post</Link>
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#3c3c3c',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            margin: '10px 0'
          }}
        >
          Logout
        </button>
      </div>
      <div className="main-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="search-category">
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
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
        </div>
        <div className="filter-buttons">
          <button
            onClick={() => sortPostsByDate(true)}
            style={{
              margin: '0 5px',
              padding: '10px 15px',
              fontSize: '14px',
              color: '#ffffff',
              backgroundColor: '#3c3c3c',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Sort Ascending
          </button>
          <button
            onClick={() => sortPostsByDate(false)}
            style={{
              margin: '0 5px',
              padding: '10px 15px',
              fontSize: '14px',
              color: '#ffffff',
              backgroundColor: '#3c3c3c',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Sort Descending
          </button>
        </div>
        <div>
          {filteredPosts.map(post => (
            <div key={post.id} className="post">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="post-profile-picture-container">
                  <img src={`http://192.168.0.10:4000${post.profilePicture}`} alt="Author" className="post-profile-picture" />
                </div>
                <h3 style={{ marginLeft: '10px', color: '#f1f1f1' }}>{post.title}</h3>
              </div>
              <p><strong>Author:</strong> {post.author}</p>
              <p><small><strong>Posted on:</strong> {post.timestamp}</small></p>
              <p><strong>Category:</strong> {post.category}</p>
              <p>{post.content}</p>
              {post.image && <img src={`http://192.168.0.10:4000${post.image}`} alt="Post" className="post-image" />}
              {post.location && (
                <div
                  dangerouslySetInnerHTML={{ __html: post.location }}
                  style={{ margin: '10px 0' }}
                />
              )}
              {post.link && (
                <p className="post-link-container">
                  <a href={post.link} target="_blank" rel="noopener noreferrer" className="post-link">
                    Click here for more details
                  </a>
                </p>
              )}
              <div className="post-actions">
                <button
                  onClick={() => handleApply(post.id)}
                  className="post-button"
                >
                  📄 Apply
                </button>
                <button
                  onClick={() => handleLike(post.id)}
                  className="post-button"
                >
                  👍 Like {post.likes}
                </button>
                <button
                  onClick={() => handleReport(post.id)}
                  className="post-button"
                >
                  🚩 Report {post.reports}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="post-button"
                >
                  💬 Comment
                </button>
              </div>
              {expandedPostId === post.id && (
                <div>
                  {comments[post.id] && comments[post.id].map((comment, index) => (
                    <p key={index}>
                      <strong>
                        <div className="post-profile-picture-container">
                          <img src={`http://192.168.0.10:4000${comment.profilePicture}`} alt="Commenter" className="post-profile-picture" />
                        </div>
                        {comment.author}:
                      </strong> {comment.text} <small>{comment.timestamp}</small>
                    </p>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="comment-input"
                    style={{
                      width: '80%',
                      padding: '10px',
                      margin: '10px 0',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '333',
                      color: '#fff',
                    }}
                  />
                  <br></br>
                  <button
                    onClick={() => handleComment(post.id)}
                    className="post-button"
                  >
                    Submit Comment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Apply</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="applyName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={applyForm.name}
                  onChange={handleApplyChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="applyNationality">
                <Form.Label>Nationality</Form.Label>
                <Form.Control
                  type="text"
                  name="nationality"
                  value={applyForm.nationality}
                  onChange={handleApplyChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="applyEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={applyForm.email}
                  onChange={handleApplyChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="applyPhone">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={applyForm.phone}
                  onChange={handleApplyChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="applyDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={applyForm.description}
                  onChange={handleApplyChange}
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleApplySubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Home;
