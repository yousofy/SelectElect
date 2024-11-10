// server/index.js
const express = require('express');
const app = express();
const PORT = 5000;

// Sample route for API calls
app.get('/getAllCourses', async (req, res) => {
    try {
        const response = await axios.get('https://ubcexplorer.io/getAllCourses');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to retrieve courses' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});