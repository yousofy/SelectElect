// server/index.js
const express = require('express');
const app = express();
const PORT = 5000;

// Sample route for API calls
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});