/**
 * Version 2.X
 * Authentication using encrypted signed cookies
 * add security with improved confidentiality
 * !Notice! cookie encryption is not usually required / recommended
 * in particular if HTTPS is used
 * 
 * /            : open (unprotected) route
 * /protected   : protected route
 * /login       : login route , handles login  (sets a cookie, add to a logged users set)
 * /logout      : logout route, handles logout (destroys cookie, removes fromlogged users set)
 */
const express = require('express');
const cookieParser = require('cookie-parser'); // middleware to parse cookies

//!!new!! encryption library for node
const crypto = require('crypto');
const MY_CRYPTO_SECRET = 'secret';
const MY_SALT = 'salt&pepper';
const key = crypto.scryptSync(MY_CRYPTO_SECRET, MY_SALT, 32);

// !!new!!  Function to encrypt cookie data
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }


// !!new!!  Function to decrypt cookie data
function decrypt(text) {
    const [ivHex, encrypted] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

// Middleware to verify if user is logged in
function isAuthenticated(req, res, next) {
    try {
      const encryptedUsername = req.signedCookies.username;
      const username = decrypt(encryptedUsername);
      if (username && loggedUsers.has(username)) {
        req.username = username; // Attach username to request for further use
        return next();
      }
    } catch (err) {
      // Ignore error and proceed to unauthorized response
    }
    res.status(401);
    res.redirect('/login.html');
  }
  
console.log("test decrypt : ", 'sir2425', encrypt('sir2425'), decrypt(encrypt('sir2425')));

  
// users and passwords
// !!! should be not hardcoded here
// !!! todo => database, encrypt
const users = {
    user1 : 'password1',
    user2 : 'password2'
}

const loggedUsers = new Set();


// a new app
const app = express();


// serve static files from the 'pub' directory
app.use(express.static('pub'));


// to handle url-encoded data from the login page
// !!! maybe not necessary for every request
app.use(express.urlencoded({ extended: true }));


// !!! new !!! encrypted cookies
// !!! new !!! Add a secret key for signed cookies
// parse cookies to use them in requests
app.use(cookieParser('secret_key'));



// !!! new !!! signed cookies
// !!! new !!! set {signed:true} in res.cookie() options
/**
 * Handles user authentication for login requests.
 * This function validates the provided username and password,
 * adds the user to the logged users pool if authenticated,
 * sets a username signed cookie, and redirects to the protected page.
 * If authentication fails, it sends an error message.
 *
 * @param {Object} req - Express request object containing the login form data.
 * @param {Object} res - Express response object used to send back the HTTP response.
 * @param {string} req.body.username - The username submitted in the login form.
 * @param {string} req.body.password - The password submitted in the login form.
 * @returns {void} This function doesn't return a value, it sends a response to the client.
 */
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (users[username] && users[username] === password) {
        const encryptedUsername = encrypt(username);
        loggedUsers.add(username);
        console.log(loggedUsers);
        res.cookie('username', encryptedUsername, { httpOnly: true, secure: true , signed: true });
        res.redirect('/protected');
    } else {
        res.send('Invalid credentials');
    }
});

// !!! new !!! encrypted cookies
// !!! new !!! access cookies with req.signedCookies
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
    const encryptedUsername = req.signedCookies.username;
    const username = decrypt(encryptedUsername);
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
const PORT = 3000;
app.listen(PORT, () => {
    console.log('listening on port', PORT);
});

