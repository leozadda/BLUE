const express = require('express');
const router = express.Router();

// This function is just to test if the server is running by calling a basic API call
router.get('/test', async (req, res) => {
   
    try {
        res.json({ message: 'Workeddd!' });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({ error: 'Could not connect to database', details: error.message });
    }
});

module.exports = router;