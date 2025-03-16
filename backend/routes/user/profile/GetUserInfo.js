const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

router.get('/get-user-info', async (req, res) => {
  try {
    // Select all fields except password_hash
    const userDetails = await pool.query(
      'SELECT id, email, google_auth, created_at, premium_status, trial_started, metric_system, newsletter, active, trial_period_ends_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userDetails.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or inactive' });
    }

    // Sanitize the response data with all fields
    const sanitizedUserData = {
      id: userDetails.rows[0].id,
      email: userDetails.rows[0].email,
      google_auth: userDetails.rows[0].google_auth,
      created_at: userDetails.rows[0].created_at,
      premiumStatus: userDetails.rows[0].premium_status,
      trialStarted: userDetails.rows[0].trial_started,
      metric_system: userDetails.rows[0].metric_system,
      newsletter: userDetails.rows[0].newsletter,
      active: userDetails.rows[0].active,
      trial_period_ends_at: userDetails.rows[0].trial_period_ends_at,
    };

    res.status(200).json(sanitizedUserData);
  } catch (error) {
    console.error('Error fetching user info:', error);
    // Don't expose error details to client
    res.status(500).json({ error: 'An error occurred while fetching user information' });
  }
});

module.exports = router;

/*

Bearer token passed-in

*/