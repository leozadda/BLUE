const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * @route GET /get-personal-records
 * @description Fetches personal records for all exercises with estimated weights for 1-30 reps
 * @access Private - Requires authentication token
 */
router.get('/get-personal-records', async (req, res) => {
    const userId = req.user.id; // User ID from the verified token
    
   
   
    
    try {
        // SQL query to get the max weight for each exercise and calculate estimated weights for 1-30 reps
        const query = `
            WITH max_weights AS (
                SELECT 
                    user_set_executions.exercise_id, 
                    MAX(user_set_phase_executions.actual_weight) AS max_weight,
                    MIN(user_set_phase_executions.completed_at) AS first_completed
                FROM user_set_phase_executions
                JOIN user_set_executions ON user_set_phase_executions.user_set_execution_id = user_set_executions.id
                WHERE user_set_phase_executions.completed_at IS NOT NULL
                AND user_set_executions.user_id = $1
                GROUP BY user_set_executions.exercise_id
            ),
            rep_series AS (
                SELECT generate_series(1, 30) AS rep
            )
            SELECT 
                exercises.id AS exercise_id,
                exercises.name AS exercise_name,
                rep_series.rep,
                max_weights.max_weight AS original_weight,
                CASE 
                    WHEN rep_series.rep = 1 THEN max_weights.max_weight -- Ensure 1-rep max is exact
                    ELSE ROUND(max_weights.max_weight / (1 + 0.0333 * rep_series.rep)) 
                END AS estimated_weight,
                max_weights.first_completed
            FROM exercises
            JOIN max_weights ON exercises.id = max_weights.exercise_id
            CROSS JOIN rep_series
            ORDER BY exercises.name, rep_series.rep;
        `;
        
        // Execute the query with the user ID as parameter
        const result = await pool.query(query, [userId]);
        
        // Transform the flat result into a more structured format for the frontend
        const personalRecords = {};
        
        result.rows.forEach(row => {
            if (!personalRecords[row.exercise_id]) {
                personalRecords[row.exercise_id] = {
                    lift: row.exercise_name,
                    maxWeight: row.original_weight,
                    firstRecorded: row.first_completed,
                    records: []
                };
            }
            
            personalRecords[row.exercise_id].records.push({
                reps: row.rep,
                weight: row.estimated_weight
            });
        });
        
        // Convert to array for easier consumption by frontend
        const recordsArray = Object.values(personalRecords);
        
       
       
        
        return res.status(200).json({
            success: true,
            message: "Personal records retrieved successfully",
            data: recordsArray
        });
        
    } catch (error) {
        console.error('Error fetching personal records:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve personal records",
            error: error.message
        });
    }
});

module.exports = router;