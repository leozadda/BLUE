const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

// This route gets the user's most recent measurement
router.get('/get-latest-measurement', async (req, res) => {
    try {
        // Get the user's ID from their login token
        const userId = req.user.id;
        
        // First try with a simpler query without joining progress_media
        const result = await pool.query(
            `SELECT *
             FROM measurement
             WHERE user_id = $1
             ORDER BY date DESC, created_at DESC
             LIMIT 1`,
            [userId]
        );

        // If we didn't find any measurements, tell the user
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No measurements found' });
        }

        // Send back the measurement data we found
        res.json(result.rows[0]);
    } catch (err) {
        // If anything goes wrong, log it and let the user know
        console.error('Error fetching latest measurement:', err);
        res.status(500).json({ error: 'Failed to fetch latest measurement' });
    }
});

module.exports = router;