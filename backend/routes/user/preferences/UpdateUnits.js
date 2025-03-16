const express = require('express'); // Import Express framework
const router = express.Router(); // Create a router object to define routes
const pool = require('../../../database/db.js'); // Import database connection pool

// Define a POST route to update unit preferences
router.post('/update-units', async (req, res) => {
  // Extract metric_system from request body
  const { metric_system } = req.body;

  // Validate that metric_system is a boolean (true/false)
  if (typeof metric_system !== 'boolean') {
    return res.status(400).json({ error: 'Metric system must be true or false' });
  }

  try {
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Start a database transaction
      await client.query('BEGIN');

      // Update the user's metric system preference
      const updateResult = await client.query(
        'UPDATE users SET metric_system = $1 WHERE id = $2 RETURNING metric_system',
        [metric_system, req.user.id]
      );

      // Check if the user was found and updated
      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK'); // Undo changes if user not found
        return res.status(404).json({ error: 'User not found' });
      }

      // Commit the transaction to save changes
      await client.query('COMMIT');

      // Send success response with updated metric system
      res.status(200).json({ 
        message: `Units updated to ${metric_system ? 'metric' : 'imperial'} system`,
        metric_system: updateResult.rows[0].metric_system
      });

    } catch (err) {
      // Rollback the transaction if an error occurs
      await client.query('ROLLBACK');
      throw err;
    } finally {
      // Always release the database connection
      client.release();
    }
  
  } catch (error) {
    // Handle unexpected errors
    console.error('Error updating units:', error);
    res.status(500).json({ 
      error: 'Could not update units preference',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export the router to be used in other files
module.exports = router;
