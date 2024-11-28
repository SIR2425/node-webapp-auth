/**
 * Version 7.0
 * !! new !! sessions
 * !! todo !! disallow register when logged in
 * Authentication using (signed) cookies
 * each cookie is appended with a signature - based on the secret
 * passwords are hashed and at a momngodb database
 * Prevents cookie modification
 *
 * /            : open (unprotected) route
 * /protected   : protected route
 * /login       : login route , handles login  (sets a cookie, add to a logged users set)
 * /logout      : logout route, handles logout (destroys cookie, removes fromlogged users set)
 */
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // middleware to parse cookies
const rateLimit = require('express-rate-limit'); // middleware to limit login attempts
const helmet = require('helmet'); // middleware to secure http headers
const bcrypt = require('bcryptjs'); // password hashing library
const mongoose = require('mongoose');



mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
  });


const User = mongoose.model('User', userSchema);


// ### old version ###
// const loggedUsers = new Set();


// middleware to limit login attempts
// Rate limiter to prevent brute-force attacks
// Limit each IP to 5 login attempts per windowMs

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,                        // 1 minute  (=> 15 min)
    max: process.env.LOGIN_RATE_LIMIT_MAX || 5,     // 5 (=> 5)
    message: 'Too many login attempts. Please try again later.'
  });



// a new app
const app = express();


// serve static files from the 'pub' directory
app.use(express.static('pub'));


// to handle url-encoded data from the login page
// !!! maybe not necessary for every request
app.use(express.urlencoded({ extended: true }));


// signed cookies
// parse cookies to use them in requests
// Add a secret key for signed cookies
// avoid default secrets in production config
app.use(cookieParser(process.env.COOKIE_SECRET || 'default_secret_key'));


// set http response headers for improved security
// helmet middleware
app.use(helmet());


//!! new !!
// setup session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Secret used to sign the session ID cookie
    resave: false, // Prevents saving session if it wasn't modified
    saveUninitialized: false, // Prevents creating a session until something is stored
    cookie: { secure: false, httpOnly: true } // set secure true if https
  }));

//!! new !! authentication middleware
// Middleware to verify if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.username) { // Check if the session contains a logged-in username
      req.username = req.session.username; // Attach username to request for further use
      return next(); // Proceed to the next middleware or route handler
    }
    res.status(401).send('Unauthorized. Please log in first.'); // If not authenticated, send an unauthorized response
  }

// !! new !! passwords are hashed
// !! login was made async to work with bcryptjs
/**
 * Handles user authentication for login requests.
 * This function validates the provided username and password,
 * adds the user to the logged users pool if authenticated,
 * sets a username signed cookie, and redirects to the protected page.
 * limits the login to a number of requests per time window
 * If authentication fails, it sends an error message.
 *
 * @param {Object} req - Express request object containing the login form data.
 * @param {Object} res - Express response object used to send back the HTTP response.
 * @param {string} req.body.username - The username submitted in the login form.
 * @param {string} req.body.password - The password submitted in the login form.
 * @returns {void} This function doesn't return a value, it sends a response to the client.
 */
app.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username }); // Find user by username in the database
      if (user) {
        const match = await bcrypt.compare(password, user.password); // Compare provided password with stored hashed password
        if (match) {
          // Store username in session to mark user as logged in
          req.session.username = username; // Store the username in the session
          return res.send('Login successful!');
        }
      }
      res.status(401).send('Invalid username or password.'); // If authentication fails, send an error response
    } catch (err) {
      res.status(500).send('Server error. Please try again later.'); // Handle server errors
    }
  });



//!! new !! isAuthenticated middleware
/**
 * Handles requests to the protected route.
 * This function checks if the user is authenticated by verifying their username cookie.
 * If authenticated, it sends a welcome message. If not, it redirects to the login page.
 *
 * @param {Object} req - Express request object containing the client's request information.
 * @param {Object} res - Express response object used to send back the desired HTTP response.
 * @param {string} req.cookies.username - The username submitted in a cookie
 * @returns {void} This function doesn't return a value, it sends a response to the client.
 */
app.get('/protected', isAuthenticated, (req,res) => {
    res.send(`Welcome to the protected route, ${req.username}!`); // Accessible only if user is authenticated
});



/**
 * Handles user logout process.
 * This function removes the user from the logged-in users set,
 * clears the username cookie, and redirects to the login page.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} This function doesn't return a value, it sends a response to the client.
 */
app.get('/logout', isAuthenticated, (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Failed to log out. Please try again.'); // Handle error during session destruction
      }
      res.send('Logout successful!'); // Send confirmation of logout
    });
  });



/**
 * Handles requests to the root page / resource.
 * No authentication is required
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} This function doesn't return a value, it sends a response to the client.
 */
app.get('/', (req, res) => {
    res.send("Hello");
});


/**
 * Handle route that registers a new user
 * @param {Object} req - Express request object containing the register form data.
 * @param {Object} res - Express response object used to send back the HTTP response.
 * @param {string} req.body.username - The username submitted in the register form.
 * @param {string} req.body.password - The password submitted in the register form.
 */
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
      res.send('User registered successfully!');
    } catch (err) {
      if (err.code === 11000) {
        res.status(400).send('Username already exists.');
      } else {
        res.status(500).send('Server error. Please try again later.');
      }
    }
  });

/**
 * Starts the Express server.
 * @param {Object} PORT - the TCP port for http server
 * @returns {void} This function doesn't return a value, it starts the server.
 */
const PORT = process.env.PORT || 3000;  // default port
app.listen(PORT, () => {
    console.log('listening on port', PORT);
});
