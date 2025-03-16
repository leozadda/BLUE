const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

// This route gets the user's most recent measurement
router.get('/get-latest-measurement', async (req, res) => {
    try {
        // Get the user's ID from their login token
        const userId = req.user.id;
        

        // Ask the database for the most recent measurement
        // This query does three things:
        // 1. Gets all measurement data (that's what m.* means)
        // 2. Also gets any photo/video info if it exists (pm.media_url, pm.media_type)
        // 3. Orders by date and gets only the most recent one (LIMIT 1)
        const result = await pool.query(
            `SELECT m.*, pm.media_url, pm.media_type
             FROM measurement m
             LEFT JOIN progress_media pm ON m.id = pm.measurement_id
             WHERE m.user_id = $1
             ORDER BY m.date DESC
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