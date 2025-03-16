const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

router.post('/update-email', async (req, res) => {
  const { email } = req.body;

  // Input validation
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if email already exists
      const existingEmail = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );

      if (existingEmail.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Update the user's email
      const updateResult = await client.query(
        'UPDATE users SET email = $1 WHERE id = $2 RETURNING email',
        [email, req.user.id]
      );

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }

      await client.query('COMMIT');

      res.status(200).json({ 
        message: 'Email updated successfully',
        email: updateResult.rows[0].email
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ 
      error: 'An error occurred while updating email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

/*
raw json
{
  "email": "test@example.com"
}

Bearer token passed-in

*/