require('dotenv').config();
const http = require('http');
const app = require('./index');
const PORT = process.env.PORT || 3060;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is in use. Trying another port...`);
        server.listen(0); // OS assigns an available port
    } else {
        console.error('Server error:', err);
    }
});
