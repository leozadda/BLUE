// File: routes/user/onboarding/OnboardingRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

// Get user's onboarding status
router.get('/onboarding/status', async (req, res) => {

  try {
    // Get user ID from the request (should be added by VerifyToken middleware)
    const userId = req.user.id;
    console.log('👤 User ID:', userId);
    
    // Get user's first-time status
    const userResult = await pool.query(
      'SELECT is_first_time_user FROM users WHERE id = $1',
      [userId]
    );
    console.log('📊 User query result:', userResult.rows);

    // If user doesn't exist, return an error
    if (userResult.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    const isFirstTimeUser = userResult.rows[0].is_first_time_user;
    console.log('🆕 Is first time user:', isFirstTimeUser);

    // Get user's completed steps - FIXED QUERY
    // This joins the user_onboarding_steps table with onboarding_steps
    // to get the step names instead of just the IDs
    const stepsResult = await pool.query(
      `SELECT os.step 
       FROM user_onboarding_steps uos
       JOIN onboarding_steps os ON uos.onboarding_step_id = os.id
       WHERE uos.user_id = $1`,
      [userId]
    );
    console.log('🔢 Steps query result:', stepsResult.rows);

    const completedSteps = stepsResult.rows.map(row => row.step);
    console.log('✅ Completed steps:', completedSteps);

    // Return both pieces of information
    res.json({
      isFirstTimeUser,
      completedSteps
    });
    console.log('✅ Successfully sent onboarding status');

  } catch (error) {
    console.error('💥 Error getting onboarding status:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

// Mark steps as completed
router.post('/onboarding/complete-steps', async (req, res) => {
  console.log('📝 Marking steps as completed for user:', req.user.id);
  
  try {
    const userId = req.user.id;
    const { steps } = req.body; // Array of step IDs (strings like 'welcome')
    
    console.log('👤 User ID:', userId);
    console.log('🔢 Steps to complete:', steps);

    if (!Array.isArray(steps) || steps.length === 0) {
      console.log('❌ Invalid steps data:', steps);
      return res.status(400).json({ error: 'Invalid steps data' });
    }

    // For each step string, get its ID from onboarding_steps and insert into user_onboarding_steps
    // This is a more robust approach than trying to build a single query with multiple values
    for (const stepName of steps) {
      console.log('🔍 Processing step:', stepName);
      
      // First get the step ID from the onboarding_steps table
      const stepResult = await pool.query(
        'SELECT id FROM onboarding_steps WHERE step = $1',
        [stepName]
      );
      console.log('📊 Step query result:', stepResult.rows);
      
      if (stepResult.rows.length > 0) {
        const stepId = stepResult.rows[0].id;
        console.log(`✅ Found step ID ${stepId} for step ${stepName}`);
        
        // Then insert the user-step relationship
        const insertResult = await pool.query(
          `INSERT INTO user_onboarding_steps (user_id, onboarding_step_id) 
           VALUES ($1, $2)
           ON CONFLICT (user_id, onboarding_step_id) DO NOTHING
           RETURNING id`,
          [userId, stepId]
        );
        
        if (insertResult.rows.length > 0) {
          console.log(`✅ Inserted new step completion record with ID ${insertResult.rows[0].id}`);
        } else {
          console.log('ℹ️ Step was already completed, no new record created');
        }
      } else {
        console.log(`⚠️ Step "${stepName}" not found in onboarding_steps table`);
      }
    }
    
    console.log('✅ All steps processed successfully');
    res.status(200).json({ message: 'Steps completed' });

  } catch (error) {
    console.error('💥 Error completing onboarding steps:', error);
    res.status(500).json({ error: 'Failed to complete onboarding steps' });
  }
});

// Mark onboarding as complete
router.post('/onboarding/complete', async (req, res) => {
  console.log('🏁 Marking onboarding as complete for user:', req.user.id);
  
  try {
    const userId = req.user.id;
    console.log('👤 User ID:', userId);

    // Update user's first-time status
    const updateResult = await pool.query(
      'UPDATE users SET is_first_time_user = FALSE WHERE id = $1 RETURNING id',
      [userId]
    );
    
    if (updateResult.rows.length > 0) {
      console.log(`✅ Updated user ${userId} to not be a first-time user`);
    } else {
      console.log(`⚠️ No user found with ID ${userId}`);
    }

    console.log('✅ Onboarding marked as complete');
    res.status(200).json({ message: 'Onboarding completed' });

  } catch (error) {
    console.error('💥 Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Reset onboarding (optional - for testing or user requests)
router.post('/onboarding/reset', async (req, res) => {
  console.log('🔄 Resetting onboarding for user:', req.user.id);
  
  try {
    const userId = req.user.id;
    console.log('👤 User ID:', userId);

    // Delete all user's completed steps
    const deleteResult = await pool.query(
      'DELETE FROM user_onboarding_steps WHERE user_id = $1 RETURNING id',
      [userId]
    );
    console.log(`✅ Deleted ${deleteResult.rowCount} completed steps`);

    // Reset user's first-time status
    const updateResult = await pool.query(
      'UPDATE users SET is_first_time_user = TRUE WHERE id = $1 RETURNING id',
      [userId]
    );
    
    if (updateResult.rows.length > 0) {
      console.log(`✅ Reset user ${userId} to be a first-time user`);
    } else {
      console.log(`⚠️ No user found with ID ${userId}`);
    }

    console.log('✅ Onboarding reset successfully');
    res.status(200).json({ message: 'Onboarding reset' });

  } catch (error) {
    console.error('💥 Error resetting onboarding:', error);
    res.status(500).json({ error: 'Failed to reset onboarding' });
  }
});

module.exports = router;