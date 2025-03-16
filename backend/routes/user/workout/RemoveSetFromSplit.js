const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * Removes a set from a user's workout plan.
 * DELETE /remove-set-from-split
 *
 * Expected Request Body:
 * {
 *   "userId": 1,
 *   "setId": 5
 * }
 */
router.delete('/remove-set-from-split', async (req, res) => {
   
   
   

    try {
        // Extract userId and setId from request body
        let { userId, setId } = req.body;
        
        // If not provided in body, try query parameters
        if (!userId || !setId) {
            console.warn('userId or setId missing in body. Checking query parameters...');
            userId = req.query.userId;
            setId = req.query.setId;
           
        }

        // If still missing, return a 400 error
        if (!userId || !setId) {
            console.error('Missing userId or setId. Aborting deletion.');
            return res.status(400).json({ 
                success: false, 
                message: 'Missing userId or setId in request' 
            });
        }

       

        // Fixed DELETE query:
        // 1. Join with user_workout_plans to verify ownership
        // 2. Delete from user_workout_plan_sets based on the join
        const result = await pool.query(
            `DELETE FROM user_workout_plan_sets
             USING user_workout_plans
             WHERE user_workout_plan_sets.id = $1
             AND user_workout_plans.id = user_workout_plan_sets.user_workout_plan_id
             AND user_workout_plans.user_id = $2
             RETURNING user_workout_plan_sets.id`,
            [setId, userId]
        );

       

        if (result.rowCount === 0) {
            console.warn('No set found or set does not belong to the user.');
            return res.status(404).json({ 
                success: false, 
                message: 'Set not found or not owned by user' 
            });
        }

       
        res.json({ success: true, message: 'Set removed from workout plan' });
    } catch (error) {
        console.error('Error removing set from split:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;