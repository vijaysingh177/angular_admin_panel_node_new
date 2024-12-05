const jwt = require('jsonwebtoken');

// Define payload (what you want in the token)
const payload = {
    username: 'admin',  // you can set this to anything
    role: 'admin',      // this can be anything you want for testing
};

// Hardcode the secret key for testing
const secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMxOTIwMzIxLCJleHAiOjE3MzE5MjM5MjF9.RqvEEUrkvMOkNQdCb8iDmTgh6eFvmgUOwR0INBHDHvM';  // Use the same secret as in your application

// Create the token with a 1-hour expiration time
const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('JWT Token:', token);
