const express = require('express');
const cors = require('cors');
const connection = require('./connection'); // Ensure database connection initializes
const menusRoutes = require('./routes/menus');
const blogsRoutes = require('./routes/blog');
const mediaRoutes = require('./routes/media');

const commentsRoutes = require('./routes/comments');
const app = express();




const middleware = require('./middleware/authenticateToken');
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors()); // Corrected from app.user to app.use
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/menus', menusRoutes);
app.use('/comments', commentsRoutes);
app.use('/blog', blogsRoutes);
app.use('/media', mediaRoutes);


// Example Route
app.get('/', (req, res) => {
    res.send('Hello from the server!');
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;
