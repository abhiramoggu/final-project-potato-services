// Add the necessary code to handle profilePicture column in comments table
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dbPath = path.resolve(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      username TEXT,
      contact TEXT,
      location TEXT,
      password TEXT,
      profilePicture TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created successfully.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      timestamp TEXT,
      likes INTEGER,
      reports INTEGER,
      author TEXT,
      category TEXT,
      image TEXT,
      link TEXT,
      location TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating posts table:', err.message);
    } else {
      console.log('Posts table created successfully.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER,
      text TEXT,
      author TEXT,
      timestamp TEXT,
      profilePicture TEXT,
      FOREIGN KEY(postId) REFERENCES posts(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating comments table:', err.message);
    } else {
      console.log('Comments table created successfully.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      postId INTEGER,
      name TEXT,
      nationality TEXT,
      email TEXT,
      phone TEXT,
      description TEXT,
      timestamp TEXT,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(postId) REFERENCES posts(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating applications table:', err.message);
    } else {
      console.log('Applications table created successfully.');
    }
  });
});

// Function to get the current time in JST
const getJSTTimestamp = () => {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });
};

// User registration
app.post('/api/register', (req, res) => {
  const { name, username, contact, location, password } = req.body;
  db.run(`INSERT INTO users (name, username, contact, location, password) VALUES (?, ?, ?, ?, ?)`, 
    [name, username, contact, location, password], function(err) {
    if (err) {
      console.error('Error inserting user:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// User login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) {
      console.error('Error querying user:', err.message);
      return res.status(400).json({ error: err.message });
    }
    if (!row) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    res.json(row);
  });
});

// Get user profile
app.get('/api/users/:username', (req, res) => {
  const username = req.params.username;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.error('Error querying user:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json(row);
  });
});

// Update user profile
app.put('/api/users/:username', upload.single('profilePicture'), (req, res) => {
  const username = req.params.username;
  const { name, contact, location, password } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : req.body.profilePicture;

  db.run(`UPDATE users SET name = ?, contact = ?, location = ?, password = ?, profilePicture = ? WHERE username = ?`, 
    [name, contact, location, password, profilePicture, username], function(err) {
    if (err) {
      console.error('Error updating user:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json({ updated: this.changes, profilePicture: profilePicture });
  });
});

// Create post
app.post('/api/posts', upload.single('image'), (req, res) => {
  const { title, content, author, category, link, location } = req.body;
  const timestamp = getJSTTimestamp();
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  db.run(`INSERT INTO posts (title, content, timestamp, likes, reports, author, category, image, link, location) VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?, ?)`, 
    [title, content, timestamp, author, category, image, link, location], function(err) {
    if (err) {
      console.error('Error inserting post:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Get all posts or posts by a specific author or category/title
app.get('/api/posts', (req, res) => {
  const author = req.query.author;
  const title = req.query.title;
  const category = req.query.category;

  let query = `SELECT posts.*, users.profilePicture FROM posts LEFT JOIN users ON posts.author = users.name`;
  let params = [];
  
  if (author) {
    query += ` WHERE author = ?`;
    params.push(author);
  }

  if (title) {
    query += author ? ` AND title LIKE ?` : ` WHERE title LIKE ?`;
    params.push(`%${title}%`);
  }

  if (category) {
    query += (author || title) ? ` AND category = ?` : ` WHERE category = ?`;
    params.push(category);
  }

  query += ` ORDER BY posts.id DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error querying posts:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Like a post
app.post('/api/posts/:id/toggle-like', (req, res) => {
  const { userId } = req.body;
  const postId = req.params.id;

  db.get(`SELECT liked FROM user_likes_reports WHERE userId = ? AND postId = ?`, [userId, postId], (err, row) => {
    if (err) {
      console.error('Error querying like status:', err.message);
      return res.status(400).json({ error: err.message });
    }

    if (row) {
      const newLikedStatus = row.liked ? 0 : 1;
      db.run(`UPDATE user_likes_reports SET liked = ? WHERE userId = ? AND postId = ?`, [newLikedStatus, userId, postId], function(err) {
        if (err) {
          console.error('Error updating like status:', err.message);
          return res.status(400).json({ error: err.message });
        }

        const likeIncrement = newLikedStatus ? 1 : -1;
        db.run(`UPDATE posts SET likes = likes + ? WHERE id = ?`, [likeIncrement, postId], function(err) {
          if (err) {
            console.error('Error updating likes:', err.message);
            return res.status(400).json({ error: err.message });
          }

          db.get(`SELECT likes FROM posts WHERE id = ?`, [postId], (err, postRow) => {
            if (err) {
              console.error('Error retrieving updated likes:', err.message);
              return res.status(400).json({ error: err.message });
            }
            res.json({ likes: postRow.likes });
          });
        });
      });
    } else {
      db.run(`INSERT INTO user_likes_reports (userId, postId, liked) VALUES (?, ?, 1)`, [userId, postId], function(err) {
        if (err) {
          console.error('Error inserting like status:', err.message);
          return res.status(400).json({ error: err.message });
        }

        db.run(`UPDATE posts SET likes = likes + 1 WHERE id = ?`, [postId], function(err) {
          if (err) {
            console.error('Error updating likes:', err.message);
            return res.status(400).json({ error: err.message });
          }

          db.get(`SELECT likes FROM posts WHERE id = ?`, [postId], (err, postRow) => {
            if (err) {
              console.error('Error retrieving updated likes:', err.message);
              return res.status(400).json({ error: err.message });
            }
            res.json({ likes: postRow.likes });
          });
        });
      });
    }
  });
});

// Report a post
app.post('/api/posts/:id/toggle-report', (req, res) => {
  const { userId } = req.body;
  const postId = req.params.id;

  db.get(`SELECT reported FROM user_likes_reports WHERE userId = ? AND postId = ?`, [userId, postId], (err, row) => {
    if (err) {
      console.error('Error querying report status:', err.message);
      return res.status(400).json({ error: err.message });
    }

    if (row) {
      const newReportedStatus = row.reported ? 0 : 1;
      db.run(`UPDATE user_likes_reports SET reported = ? WHERE userId = ? AND postId = ?`, [newReportedStatus, userId, postId], function(err) {
        if (err) {
          console.error('Error updating report status:', err.message);
          return res.status(400).json({ error: err.message });
        }

        const reportIncrement = newReportedStatus ? 1 : -1;
        db.run(`UPDATE posts SET reports = reports + ? WHERE id = ?`, [reportIncrement, postId], function(err) {
          if (err) {
            console.error('Error updating reports:', err.message);
            return res.status(400).json({ error: err.message });
          }

          db.get(`SELECT reports FROM posts WHERE id = ?`, [postId], (err, postRow) => {
            if (err) {
              console.error('Error retrieving updated reports:', err.message);
              return res.status(400).json({ error: err.message });
            }
            res.json({ reports: postRow.reports });
          });
        });
      });
    } else {
      db.run(`INSERT INTO user_likes_reports (userId, postId, reported) VALUES (?, ?, 1)`, [userId, postId], function(err) {
        if (err) {
          console.error('Error inserting report status:', err.message);
          return res.status(400).json({ error: err.message });
        }

        db.run(`UPDATE posts SET reports = reports + 1 WHERE id = ?`, [postId], function(err) {
          if (err) {
            console.error('Error updating reports:', err.message);
            return res.status(400).json({ error: err.message });
          }

          db.get(`SELECT reports FROM posts WHERE id = ?`, [postId], (err, postRow) => {
            if (err) {
              console.error('Error retrieving updated reports:', err.message);
              return res.status(400).json({ error: err.message });
            }
            res.json({ reports: postRow.reports });
          });
        });
      });
    }
  });
});

// Add a comment
app.post('/api/posts/:id/comment', (req, res) => {
  const { text, author, profilePicture } = req.body;
  const postId = req.params.id;
  const timestamp = getJSTTimestamp();
  db.run(`INSERT INTO comments (postId, text, author, timestamp, profilePicture) VALUES (?, ?, ?, ?, ?)`, 
    [postId, text, author, timestamp, profilePicture], function(err) {
    if (err) {
      console.error('Error inserting comment:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID, timestamp: timestamp });
  });
});

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  db.all(`SELECT comments.*, users.profilePicture FROM comments LEFT JOIN users ON comments.author = users.name WHERE postId = ? ORDER BY comments.id DESC`, [postId], (err, rows) => {
    if (err) {
      console.error('Error querying comments:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Apply for a post
app.post('/api/posts/:id/apply', (req, res) => {
  const { userId, postId, name, nationality, email, phone, description } = req.body;
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });

  // Get the author of the post
  db.get(`SELECT author FROM posts WHERE id = ?`, [postId], (err, post) => {
    if (err) {
      console.error('Error fetching post author:', err.message);
      return res.status(400).json({ error: err.message });
    }

    if (!post) {
      console.error('Post not found');
      return res.status(404).json({ error: 'Post not found' });
    }

    const author = post.author;

    db.run(`INSERT INTO applications (userId, postId, name, nationality, email, phone, description, timestamp, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, postId, name, nationality, email, phone, description, timestamp, author], function (err) {
        if (err) {
          console.error('Error inserting application:', err.message);
          return res.status(400).json({ error: err.message });
        }
        console.log('Application inserted:', { id: this.lastID, timestamp, author }); // Debugging line
        res.json({ id: this.lastID, timestamp });
      });
  });
});


// Edit a post
app.put('/api/posts/:id', (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body;
  const timestamp = getJSTTimestamp();
  db.run(`UPDATE posts SET title = ?, content = ?, timestamp = ? WHERE id = ?`, [title, content, timestamp, id], function(err) {
    if (err) {
      console.error('Error updating post:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json({ updated: this.changes });
  });
});

// Delete a post
app.delete('/api/posts/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM posts WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('Error deleting post:', err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// Get applications for a user's posts
app.get('/api/applications', (req, res) => {
  const author = req.query.author;
  if (!author) {
    return res.status(400).json({ error: 'Author query parameter is required' });
  }

  console.log(`Querying applications for author: ${author}`); // Debugging line
  db.all(`SELECT a.*, p.title AS postTitle FROM applications a 
          JOIN posts p ON a.postId = p.id 
          WHERE p.author = ? ORDER BY a.timestamp DESC`, [author], (err, rows) => {
    if (err) {
      console.error('Error querying applications:', err.message);
      return res.status(400).json({ error: err.message });
    }
    console.log('Applications retrieved:', rows); // Debugging line
    res.json(rows);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
