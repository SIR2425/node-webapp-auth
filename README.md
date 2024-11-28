> este [ficheiro em português](./README.pt.md)
# Web App: Progressive Implementation of Authentication and Security

This repository documents the progressive implementation of authentication and security mechanisms in a Node.js web application across multiple versions. Each version adds incremental improvements to enhance security, from basic authentication to database integration and session handling.

## Version Progression

### Version 1: Basic Authentication with Cookies
- **File:** `app_v_1.js`
- **Description:**
  - Introduced basic user authentication using unencrypted cookies.
  - Users are manually added to a `Set` upon successful login.
  - Routes:
    - `/login`: Sets a cookie for authentication.
    - `/logout`: Clears the authentication cookie.
    - `/protected`: Validates the cookie to allow access.
- **Limitations:**
  - Cookies are unencrypted.
  - User credentials are hardcoded and stored in plaintext.
  - No protection against cookie tampering.

---

### Version 2: Signed Cookies for Integrity
- **File:** `app_v_2.js`
- **Description:**
  - Upgraded to signed cookies to prevent tampering.
  - Introduced a secret key to sign cookies.
  - Routes remain the same as Version 1.
- **Improvements:**
  - Signed cookies ensure data integrity.
  - Enhanced protection against cookie manipulation.
- **Limitations:**
  - Still uses plaintext passwords.
  - No encryption for cookie data.

---

### Version 2.X: Encrypted Cookies
- **File:** `app_v_2_X.js`
- **Description:**
  - Added cookie encryption for confidentiality.
  - Functions to encrypt and decrypt cookie values were implemented.
- **Improvements:**
  - Prevents sensitive data from being exposed in cookies.
- **Limitations:**
  - Encryption for cookies is redundant if HTTPS is enforced.
  - Still relies on plaintext passwords.

---

### Version 3: Rate Limiting and Helmet
- **File:** `app_v_3.js`
- **Description:**
  - Added rate limiting on login attempts using `express-rate-limit`.
  - Secured HTTP headers with `helmet`.
- **Improvements:**
  - Mitigates brute-force attacks with login rate limiting.
  - Protects against common web vulnerabilities (e.g., XSS) via HTTP headers.
- **Limitations:**
  - No password hashing; passwords are still in plaintext.

---

### Version 4: Password Hashing
- **File:** `app_v_4.js`
- **Description:**
  - Passwords are hashed using `bcryptjs` before storage.
  - Authentication now compares the hashed password.
- **Improvements:**
  - Secure storage of user passwords.
- **Limitations:**
  - Users are still hardcoded.
  - No integration with external storage or databases.

---

### Version 5: Environment Variables
- **File:** `app_v_5.js`
- **Description:**
  - Introduced `.env` file for managing sensitive configurations (e.g., secret keys).
  - Rate limits and cookie secrets are configurable via environment variables.
- **Improvements:**
  - Easier management of application configurations.
  - Reduced risk of exposing secrets in source code.
- **Limitations:**
  - Still lacks database integration for dynamic user management.

---

### Version 6: Database Integration
- **File:** `app_v_6.js`
- **Description:**
  - Integrated MongoDB for dynamic user storage.
  - Added a registration route (`/register`) to create new users.
  - User credentials are securely hashed and stored in the database.
- **Improvements:**
  - Dynamic user management through MongoDB.
  - Centralized storage for better scalability.
- **Limitations:**
  - Uses cookie-based authentication, which can be improved with session handling.

---

### Version 7: Session Management
- **File:** `app_v_7.js`
- **Description:**
  - Introduced session-based authentication using `express-session`.
  - Replaced cookie-based authentication with session storage.
- **Improvements:**
  - Sessions provide more secure and scalable authentication management.
  - Reduced reliance on client-side cookies for storing sensitive information.
- **Limitations:**
  - Requires further enhancements for distributed session management (e.g., Redis).

---



## How to Use
### dependencies
1. Install dependencies:
   ```bash
   npm install
   ````
### .env file
From version 5 onwards, create a .env file with the necessary configurations (refer to app_v_5.js for required variables).

### database
From version 6 onwards, ensure that a mongoDB DMBS is running. Con
Start the server:

### how to run

```bash
node app_v_7.js
```
Access the application at http://localhost:3000.

### routes
## Routes Overview

This document describes the routes implemented in the web application, detailing their purpose, accessibility, and security features.

---

### Public Routes

#### `/`
- **Description:** 
  - The root route of the application. It is accessible to all users without any authentication.
- **Purpose:** 
  - Displays a basic message like "Hello" to signify the server is running.
- **Accessibility:** 
  - Publicly accessible (no authentication required).

---

### Authentication and User Management Routes

#### `/login`
- **Description:**
  - Handles user login requests.
  - Users provide their username and password via a form.
  - On successful authentication:
    - A cookie (in earlier versions) or session (in later versions) is created.
    - The user is redirected to the `/protected` route.
  - On failure:
    - An error message is displayed.
- **Security Features:**
  - **Version 1:** Unencrypted cookies for authentication.
  - **Version 2:** Signed cookies to ensure data integrity.
  - **Version 3-5:** Rate limiting, HTTP headers security, and hashed passwords.
  - **Version 6-7:** MongoDB integration for user storage and session-based authentication.
- **Accessibility:** 
  - Publicly accessible.

#### `/logout`
- **Description:**
  - Logs out the user by:
    - Clearing the authentication cookie or destroying the session.
    - Redirecting to the login page (`/login.html`).
- **Purpose:**
  - Ensures users can securely end their session.
- **Accessibility:** 
  - Requires authentication (in later versions).

#### `/register` (Introduced in Version 6)
- **Description:**
  - Allows users to register a new account by providing a username and password.
  - The password is securely hashed and stored in a MongoDB database.
- **Purpose:**
  - Facilitates dynamic user registration for new accounts.
- **Accessibility:**
  - Publicly accessible (restricted when logged in from Version 7).

---

### Protected Routes

#### `/protected`
- **Description:**
  - A secure route that is accessible only to authenticated users.
  - Validates user authentication via:
    - Cookies (Versions 1-6).
    - Session storage (Version 7).
  - Displays a personalized message (e.g., "Welcome, [username]!").
- **Purpose:**
  - Demonstrates how restricted resources can be secured.
- **Accessibility:**
  - Requires authentication.

---

### Error Handling
- Unauthenticated users attempting to access `/protected` or other restricted routes are:
  - Redirected to `/login.html`.
  - Shown an error message indicating they need to log in.

---

### Summary of Routes

| Route       | Description                                | Accessibility      | Authentication Required |
|-------------|--------------------------------------------|--------------------|-------------------------|
| `/`         | Root route with a basic welcome message.   | Public             | No                      |
| `/login`    | User login. Redirects to `/protected` on success. | Public             | No                      |
| `/logout`   | Logs out the user and redirects to login.  | Restricted         | Yes                     |
| `/register` | User registration for creating new accounts. | Public             | No (restricted in v7)   |
| `/protected`| Secure route accessible to authenticated users. | Restricted         | Yes                     |


## Future Work (possible)
- Implement token-based authentication (e.g., JWT) for stateless APIs.
- Add multifactor authentication (MFA) for enhanced security.
- Integrate distributed session storage using Redis or Memcached.
# node-webapp-auth
