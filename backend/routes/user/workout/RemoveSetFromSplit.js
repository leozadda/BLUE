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
    console.log('[START] DELETE /remove-set-from-split endpoint triggered');
    
    try {
        // Extract userId and setId from request body
        let { userId, setId } = req.body;
        console.log('[INFO] Request body received:', req.body);
        console.log('[INFO] Initial values - userId:', userId, ', setId:', setId);
        
        // If not provided in body, try query parameters
        if (!userId || !setId) {
            console.warn('[WARN] userId or setId missing in body. Checking query parameters...');
            userId = req.query.userId;
            setId = req.query.setId;
            console.log('[INFO] Values from query parameters - userId:', userId, ', setId:', setId);
        }

        // If still missing, return a 400 error
        if (!userId || !setId) {
            console.error('[ERROR] Missing userId or setId. Aborting deletion.');
            console.log('[END] Request terminated due to missing parameters');
            return res.status(400).json({ 
                success: false, 
                message: 'Missing userId or setId in request' 
            });
        }
        
        console.log('[INFO] Proceeding with deletion for userId:', userId, 'and setId:', setId);

        // Fixed DELETE query:
        // 1. Join with user_workout_plans to verify ownership
        // 2. Delete from user_workout_plan_sets based on the join
        console.log('[DEBUG] Executing DELETE query on database');
        const result = await pool.query(
            `DELETE FROM user_workout_plan_sets
             USING user_workout_plans
             WHERE user_workout_plan_sets.id = $1
             AND user_workout_plans.id = user_workout_plan_sets.user_workout_plan_id
             AND user_workout_plans.user_id = $2
             RETURNING user_workout_plan_sets.id`,
            [setId, userId]
        );
        console.log('[DEBUG] Query executed. Result:', result);

        if (result.rowCount === 0) {
            console.warn('[WARN] No set found or set does not belong to the user.');
            console.log('[END] No matching set found. Returning 404');
            return res.status(404).json({ 
                success: false, 
                message: 'Set not found or not owned by user' 
            });
        }
        
        console.log('[INFO] Set successfully removed from workout plan. Deleted setId:', result.rows[0].id);
        console.log('[END] DELETE /remove-set-from-split endpoint completed successfully');
        res.json({ success: true, message: 'Set removed from workout plan' });
    } catch (error) {
        console.error('[ERROR] Error removing set from split:', error);
        console.log('[END] DELETE endpoint encountered an error');
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
