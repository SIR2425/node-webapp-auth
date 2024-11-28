/**
 * Version 5.0
 * !! new !! environment vars (a .env file was created)
 * Authentication using (signed) cookies
 * each cookie is appended with a signature - based on the secret
 * passwords are hashed
 * Prevents cookie modification
 * 
 * /            : open (unprotected) route
 * /protected   : protected route
 * /login       : login route , handles login  (sets a cookie, add to a logged users set)
 * /logout      : logout route, handles logout (destroys cookie, removes fromlogged users set)
 */
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser'); // middleware to parse cookies
const rateLimit = require('express-rate-limit'); // middleware to limit login attempts
const helmet = require('helmet'); // middleware to secure http headers
const bcrypt = require('bcryptjs'); // password hashing library


// !! new !! hashing
// users and passwords
// !!! should be not hardcoded here
// !!! todo => database
//const users = {
//    user1 : 'password1',
//    user2 : 'password2'
//}

// Hardcoded users with hashed passwords, generated with the following script
//bcrypt.hash('password2', 10, (err, hash) => {
//    if (err) throw err;
//    console.log(hash);
//  });

const users = {
    "user1": "$2a$10$FNZYuZoWTmBJN9qEdOeZLeXBEfrYADylwpjGJflwQKis/GFKzSOhC", // hashed 'password1'
    "user2": "$2a$10$eYEw2GblLMw2ZD/tmR9ZDeCMutaib98rXwQ3BtjkA0BkiJ0vqFXIC"  // hashed 'password2'
  };

const loggedUsers = new Set();


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



//!! new !!
// set http response headers for improved security
// helmet middleware
app.use(helmet());



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
    const username = req.body.username;
    const password = req.body.password;
    if (users[username]) {  // if username / password exists in users object
        const match = await bcrypt.compare(password, users[username]);
        if (match) {
            loggedUsers.add(username);
            console.log(loggedUsers);
            res.cookie('username', username, { httpOnly: true, secure: true , signed: true });
            res.redirect('/protected');
        }
    } else {
        res.send('Invalid credentials');
    }
});



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
app.get('/protected', (req,res) => {
    const username = req.signedCookies.username;
    console.log(username);
    if (loggedUsers.has(username)) {
        res.send(`Hello ${username}, you are authenticated!`);
    } else {
        res.redirect('/login.html');
    }
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
app.get('/logout', (req,res) => {
    const username = req.signedCookies.username;
    loggedUsers.delete(username);
    res.clearCookie('username');
    res.redirect('/login.html');
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
 * Starts the Express server.
 * @param {Object} PORT - the TCP port for http server
 * @returns {void} This function doesn't return a value, it starts the server.
 */
const PORT = process.env.PORT || 3000;  // default port
app.listen(PORT, () => {
    console.log('listening on port', PORT);
});

