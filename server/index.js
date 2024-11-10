const express = require('express');
const axios = require('axios'); // Ensure axios is installed and imported
const cors = require('cors');  // Import the cors module
const app = express();
const PORT = 5000;

app.use(cors());

app.use(express.json()); // Middleware to parse JSON in request body

app.get('/getAllCourses', async (req, res) => {
    try {
        // Fetch all courses from the external API
        const response = await axios.get('https://ubcexplorer.io/getAllCourses');
        const allCourses = response.data;

        console.log('All Courses:', allCourses); // Log the API response

        // Get the search query from the request query string
        const searchTerm = req.query.search || ''; // Defaults to an empty string if no search term is provided

        // Filter courses based on whether the `name` or `desc` fields contain the search term
        const filteredCourses = allCourses.filter(course => {
            const nameMatch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
            const descMatch = course.desc && course.desc.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || descMatch;
        });

        // Return the filtered list of courses as JSON
        res.json(filteredCourses);
    } catch (error) {
        console.error('Error fetching or filtering courses:', error.message); // Log the error message
        res.status(500).json({ error: 'Failed to retrieve courses' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

