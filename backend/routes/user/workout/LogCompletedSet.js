// ================ LOG COMPLETED SET (routes/workout/LogCompletedSet.js) ================
const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * Logs a completed workout set with all its phases into the database
 * This endpoint records the actual performance of a workout set including weights, reps, and rest periods
 * 
 * Endpoint: POST /log-completed-set
 * 
 * Request body format:
 * {
 *   "userId": 1,       // The user who completed the set
 *   "setTypeId": 2,    // The type of set (e.g., normal, drop set, super set)
 *   "exerciseId": 3,   // The exercise performed
 *   "baseWeight": 100, // The base weight used for calculations
 *   "phases": [        // Array of phases within the set
 *     {
 *       "phaseNumber": 1,                  // Order of the phase in the set
 *       "actualReps": 12,                  // Reps actually performed
 *       "actualWeight": 100,               // Weight actually used
 *       "actualRestPeriodSeconds": 60      // Rest time taken after the phase
 *     }
 *   ]
 * }
 * 
 * Database tables used:
 * - user_set_executions: Records the main set execution
 * - user_set_phase_executions: Records individual phases within the set
 * 
 * Returns:
 * - success: boolean
 * - setExecutionId: number (the ID of the newly created set execution)
 */
router.post('/log-completed-set', async (req, res) => {
    const client = await pool.connect();
   

    try {
        // Start transaction
        await client.query('BEGIN');
       

        const { userId, setTypeId, exerciseId, baseWeight, phases } = req.body;

        // Validate input data
        if (!userId || !setTypeId || !exerciseId || !baseWeight || !phases || !phases.length) {
            console.error('Missing required fields in request body');
            throw new Error('Missing required fields');
        }

        // Insert main set execution
       
        const setResult = await client.query(
            `INSERT INTO user_set_executions 
             (user_id, set_type_id, exercise_id, base_weight, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING id`,
            [userId, setTypeId, exerciseId, baseWeight]
        );

        const setExecutionId = setResult.rows[0].id;
       

        // Insert each phase
       
        for (const phase of phases) {
           
            
            // Validate phase data
            if (!phase.phaseNumber || !phase.actualReps || !phase.actualWeight) {
                console.error('Invalid phase data:', phase);
                throw new Error('Invalid phase data');
            }

            await client.query(
                `INSERT INTO user_set_phase_executions 
                 (user_set_execution_id, phase_number, actual_reps, 
                  actual_weight, actual_rest_period_seconds, completed_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [setExecutionId, phase.phaseNumber, phase.actualReps, 
                 phase.actualWeight, phase.actualRestPeriodSeconds]
            );
           
        }

        // Commit transaction
        await client.query('COMMIT');
       
        
        res.json({ success: true, setExecutionId });
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error logging completed set:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        
        res.status(500).json({ success: false, error: error.message });
    } finally {
        // Release database client
       
        client.release();
    }
});

module.exports = router;