// server.js
const express = require('express');
const session = require('express-session'); // Add this line
const app = express();
const PORT = 3000;

// uses the qs library
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 30 // 30 seconds
    } 
}));

// Simple user data
// todo : use db instead
// todo : encrypt password
// todo :
const users = {
  user1: 'password1',
  user2: 'password2'
};

// Middleware to check authentication
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Serve static files
app.use(express.static('public'));

// Login route
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    req.session.user = username;
    res.redirect('/protected');
  } else {
    res.send('Invalid credentials');
  }
});

// Protected route
app.get('/protected', checkAuth, (req, res) => {
  res.send(`Hello ${req.session.user}, you are authenticated!`);
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});