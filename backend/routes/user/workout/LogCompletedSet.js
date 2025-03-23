// routes/workout/LogCompletedSet.js
const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

router.post('/log-completed-set', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { userId, setTypeId, exerciseId, baseWeight, scheduledDate, phases } = req.body;

        // Validate input
        if (!userId || !setTypeId || !exerciseId || !baseWeight || !phases?.length) {
            console.error('[ERROR] Missing required fields');
            return res.status(400).json({ success: false, error: 'Missing required fields' });
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

        // Insert phases
        for (const [index, phase] of phases.entries()) {

            await client.query(
                `INSERT INTO user_set_phase_executions 
                 (user_set_execution_id, phase_number, actual_reps, 
                  actual_weight, actual_rest_period_seconds, completed_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [setExecutionId, phase.phaseNumber, phase.actualReps, 
                 phase.actualWeight, phase.actualRestPeriodSeconds]
            );
        }
        
        const deleteQuery = `
            SELECT uwps.id 
            FROM user_workout_plan_sets uwps
            JOIN user_workout_plans uwp ON uwps.user_workout_plan_id = uwp.id
            WHERE uwp.user_id = $1 
            AND uwps.exercise_id = $2 
            AND uwp.scheduled_date = $3`;
            
        const deleteResult = await client.query(deleteQuery, [userId, exerciseId, scheduledDate]);
        const setIds = deleteResult.rows.map(row => row.id);

        await client.query('COMMIT');

        res.json({ 
            success: true, 
            setExecutionId,
            setIds 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[ERROR] Transaction rolled back:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
});

module.exports = router;