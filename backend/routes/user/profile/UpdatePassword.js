const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');
const bcrypt = require('bcryptjs');

router.post('/update-password', async (req, res) => {
  const { password } = req.body;

  // Make sure password was provided
  if (!password || !password.trim()) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Check if password is strong enough
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    // Connect to database
    const client = await pool.connect();
    
    try {
      // Start a database transaction
      await client.query('BEGIN');

      // Create a secure version of the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Try to update the user's password
      const updateResult = await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
        [hashedPassword, req.user.id]
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
        message: 'Password updated successfully'
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
    console.error('Error updating password:', error);
    res.status(500).json({ 
      error: 'Could not update password',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

/*
raw json
{
  "password": "kncjbnslnsoicn"
}

Bearer token passed-in

*/