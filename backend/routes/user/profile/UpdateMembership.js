const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

router.post('/update-membership', async (req, res) => {
  // Get premium status from request body
  const { premium_status } = req.body;

  // Make sure premium_status is provided and is a boolean
  if (typeof premium_status !== 'boolean') {
    return res.status(400).json({ error: 'Premium status must be true or false' });
  }

  try {
    // Connect to database
    const client = await pool.connect();
    
    try {
      // Start a database transaction
      await client.query('BEGIN');

      // Try to update the user's membership
      const updateResult = await client.query(
        'UPDATE users SET premium_status = $1 WHERE id = $2 RETURNING premium_status',
        [premium_status, req.user.id]
      );

      // If no user was found with that ID
      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }

      // If everything worked, save the changes
      await client.query('COMMIT');

      // Send back success message
      res.status(200).json({ 
        message: 'Membership updated successfully',
        premium_status: updateResult.rows[0].premium_status
      });

    } catch (err) {
      // If anything went wrong, undo the changes
      await client.query('ROLLBACK');
      throw err;
    } finally {
      // Always disconnect from database when done
      client.release();
    }

  } catch (error) {
    // If there's any error, let the user know
    console.error('Error updating membership:', error);
    res.status(500).json({ 
      error: 'Could not update membership',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

/*

Bearer token passed-in

*/