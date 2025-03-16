// File: routes/user/onboarding/OnboardingRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

// Get user's onboarding status
router.get('/onboarding/status', async (req, res) => {
 
  
  try {
    // Get user ID from the request (should be added by VerifyToken middleware)
    const userId = req.user.id;
   
    
    // Get user's first-time status
    const userResult = await pool.query(
      'SELECT is_first_time_user FROM users WHERE id = $1',
      [userId]
    );

    // If user doesn't exist, return an error
    if (userResult.rows.length === 0) {
     
      return res.status(404).json({ error: 'User not found' });
    }

    const isFirstTimeUser = userResult.rows[0].is_first_time_user;
   

    // Get user's completed steps
    const stepsResult = await pool.query(
      'SELECT step FROM user_onboarding_steps WHERE user_id = $1',
      [userId]
    );

    const completedSteps = stepsResult.rows.map(row => row.step);
   

    // Return both pieces of information
    res.json({
      isFirstTimeUser,
      completedSteps
    });

  } catch (error) {
    console.error('💥 Error getting onboarding status:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

// Mark steps as completed
router.post('/onboarding/complete-steps', async (req, res) => {
 
  
  try {
    const userId = req.user.id;
    const { steps } = req.body; // Array of step IDs
    
   
   

    if (!Array.isArray(steps) || steps.length === 0) {
     
      return res.status(400).json({ error: 'Invalid steps data' });
    }

    // Create a parameterized query with multiple values
    // This is more efficient than making multiple queries
    const values = steps.map((step, index) => `($1, $${index + 2})`).join(', ');
    const params = [userId, ...steps];
    
   
   

    // Insert all steps in one query with ON CONFLICT DO NOTHING
    await pool.query(
      `INSERT INTO user_onboarding_steps (user_id, step) 
       VALUES ${values}
       ON CONFLICT (user_id, step) DO NOTHING`,
      params
    );

   
    res.status(200).json({ message: 'Steps completed' });

  } catch (error) {
    console.error('💥 Error completing onboarding steps:', error);
    res.status(500).json({ error: 'Failed to complete onboarding steps' });
  }
});

// Mark onboarding as complete
router.post('/onboarding/complete', async (req, res) => {
 
  
  try {
    const userId = req.user.id;
   

    // Update user's first-time status
    await pool.query(
      'UPDATE users SET is_first_time_user = FALSE WHERE id = $1',
      [userId]
    );

   
    res.status(200).json({ message: 'Onboarding completed' });

  } catch (error) {
    console.error('💥 Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Reset onboarding (optional - for testing or user requests)
router.post('/onboarding/reset', async (req, res) => {
 
  
  try {
    const userId = req.user.id;
   

    // Delete all user's completed steps
    await pool.query(
      'DELETE FROM user_onboarding_steps WHERE user_id = $1',
      [userId]
    );

    // Reset user's first-time status
    await pool.query(
      'UPDATE users SET is_first_time_user = TRUE WHERE id = $1',
      [userId]
    );

   
    res.status(200).json({ message: 'Onboarding reset' });

  } catch (error) {
    console.error('💥 Error resetting onboarding:', error);
    res.status(500).json({ error: 'Failed to reset onboarding' });
  }
});

module.exports = router;