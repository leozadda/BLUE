const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * PUT /update-user-split
 * Records or updates the actual performance for a phase of an exercise
 * 
 * Required fields:
 * - executionId: ID of the exercise execution to update
 * - phaseNumber: Number of the phase being completed
 * - actualReps: Number of reps completed
 * - actualWeight: Weight used for the set
 * - actualRestPeriodSeconds: Rest period taken after the set
 * 
 * Returns:
 * - Updated phase details including completion status
 * - Progress towards exercise completion
 */
router.put('/update-user-split', async (req, res) => {
    try {
        const { 
            executionId, 
            phaseNumber, 
            actualReps, 
            actualWeight, 
            actualRestPeriodSeconds 
        } = req.body;

        // Validate required fields
        if (!executionId || phaseNumber === undefined || !actualReps || !actualWeight) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['executionId', 'phaseNumber', 'actualReps', 'actualWeight']
            });
        }

        // Begin transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update or insert the phase execution
            const phaseResult = await client.query(
                `INSERT INTO user_set_phase_executions 
                 (user_set_execution_id, phase_number, actual_reps, actual_weight, 
                  actual_rest_period_seconds, completed_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 ON CONFLICT (user_set_execution_id, phase_number) 
                 DO UPDATE SET 
                   actual_reps = $3,
                   actual_weight = $4,
                   actual_rest_period_seconds = $5,
                   completed_at = NOW()
                 RETURNING *`,
                [executionId, phaseNumber, actualReps, actualWeight, actualRestPeriodSeconds]
            );

            // Get exercise execution details
            const exerciseDetails = await client.query(
                `SELECT 
                    use.id, use.base_weight,
                    e.name as exercise_name,
                    st.name as set_type_name,
                    COUNT(DISTINCT stt.phase_number) as total_phases,
                    COUNT(DISTINCT uspe.phase_number) as completed_phases
                 FROM user_set_executions use
                 JOIN exercises e ON use.exercise_id = e.id
                 JOIN set_types st ON use.set_type_id = st.id
                 JOIN set_type_templates stt ON st.id = stt.set_type_id
                 LEFT JOIN user_set_phase_executions uspe ON use.id = uspe.user_set_execution_id
                 WHERE use.id = $1
                 GROUP BY use.id, use.base_weight, e.name, st.name`,
                [executionId]
            );

            await client.query('COMMIT');

            // Construct response
            const response = {
                phaseExecution: {
                    id: phaseResult.rows[0].id,
                    phaseNumber,
                    actualReps,
                    actualWeight,
                    actualRestPeriodSeconds,
                    completedAt: phaseResult.rows[0].completed_at
                },
                exerciseProgress: {
                    exerciseName: exerciseDetails.rows[0].exercise_name,
                    setTypeName: exerciseDetails.rows[0].set_type_name,
                    completedPhases: exerciseDetails.rows[0].completed_phases,
                    totalPhases: exerciseDetails.rows[0].total_phases,
                    isCompleted: exerciseDetails.rows[0].completed_phases === exerciseDetails.rows[0].total_phases
                },
                message: 'Phase execution updated successfully'
            };

            return res.status(200).json(response);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error updating user split:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;