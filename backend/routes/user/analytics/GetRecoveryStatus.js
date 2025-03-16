const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * GET /muscle-recovery-status
 * 
 * Retrieves the recovery status for all muscle groups for the authenticated user.
 * Each muscle group includes:
 * - Muscle group name
 * - Recovery rate (how quickly the muscle recovers)
 * - Last trained date (when the muscle was last exercised)
 * - Days since trained (how many days since last workout)
 * - Recovery percentage (calculated based on time passed and recovery rate)
 * 
 * Authentication: Requires valid JWT token (handled by VerifyToken middleware)
 * Parameters: None (user ID extracted from token)
 * Returns: Array of muscle groups with recovery information
 */
router.get('/muscle-recovery-status', async (req, res) => {
    try {
        // Log the request
       
        
        // Get authenticated user ID from token (added by VerifyToken middleware)
        const userId = req.user.id;
        
        // SQL query to calculate muscle recovery status
        const muscleRecoveryQuery = `
            WITH last_training AS (
                SELECT 
                    muscle_groups.name AS muscle_group,
                    MAX(user_set_phase_executions.completed_at) AS last_trained_date
                FROM user_set_phase_executions
                JOIN user_set_executions 
                    ON user_set_phase_executions.user_set_execution_id = user_set_executions.id
                JOIN exercise_muscle_targets 
                    ON user_set_executions.exercise_id = exercise_muscle_targets.exercise_id
                JOIN muscle_groups 
                    ON muscle_groups.id = exercise_muscle_targets.muscle_group_id
                WHERE user_set_executions.user_id = $1
                GROUP BY muscle_groups.name
            )
            SELECT 
                muscle_groups.name AS muscle_group,
                muscle_recovery_rates.recovery_rate,
                last_training.last_trained_date,
                CASE 
                    WHEN last_training.last_trained_date IS NULL THEN NULL
                    ELSE EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_training.last_trained_date)) / 86400.0
                END AS days_since_trained,
                CASE 
                    WHEN last_training.last_trained_date IS NULL THEN 100
                    ELSE LEAST(100, (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_training.last_trained_date)) / 86400.0 * muscle_recovery_rates.recovery_rate * 100))
                END AS recovery_percentage
            FROM muscle_groups
            JOIN muscle_recovery_rates 
                ON LOWER(muscle_groups.name) = LOWER(muscle_recovery_rates.muscle_group)
            LEFT JOIN last_training 
                ON muscle_groups.name = last_training.muscle_group
            ORDER BY muscle_groups.name;
        `;
        
        // Execute the query with the user ID
        const result = await pool.query(muscleRecoveryQuery, [userId]);
        
        // Log success
       
        
        // Return the result
        return res.status(200).json({
            success: true,
            message: 'Muscle recovery status retrieved successfully',
            data: result.rows
        });
        
    } catch (error) {
        // Log the error
        console.error('Error retrieving muscle recovery status:', error);
        
        // Return error response
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve muscle recovery status',
            error: error.message
        });
    }
});

module.exports = router;