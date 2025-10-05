const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { users, saveUsers } = require('./data/users');

const app = express();

// Configure CORS to allow both development ports
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

// Middleware configurations
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// Configure body-parser with strict JSON parsing
app.use(express.json({
  strict: true,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

// Session configuration
app.use(session({
  secret: 'demo_insecure_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 86400000,
    secure: false // set to true if using https
  }
}));

// Routes
app.get('/profile', (req, res) => {
  if (req.session.user) {
    res.json({ 
      loggedIn: true, 
      user: { 
        username: req.session.user.username 
      } 
    });
  } else {
    res.status(401).json({ 
      loggedIn: false, 
      message: "Not authenticated" 
    });
  }
});

app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      req.session.user = user;
      res.json({ 
        success: true, 
        message: "Login successful" 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

app.get('/users', (req, res) => {
  const safeUsers = users.map(user => ({
    username: user.username
  }));
  res.json({ users: safeUsers });
});

app.post('/register', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ 
        success: false, 
        message: "Username already exists" 
      });
    }

    users.push({ username, password });
    saveUsers();

    res.status(201).json({ 
      success: true, 
      message: "Registration successful" 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Start server
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
