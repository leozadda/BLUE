// ================ ADD SET TO SPLIT (routes/workout/AddSetToSplit.js) ================
const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * Adds a new set and all its phases to a user's workout plan with exercise information
 * POST /add-set-to-split
 * 
 * Request body should contain:
 * {
 *   "userId": 1,
 *   "scheduledDate": "2025-02-21",
 *   "setTemplateId": 2,       // Changed from setTemplateId to setTemplateId to get all phases
 *   "plannedBaseWeight": 100,
 *   "exerciseId": 5
 * }
 * 
 * This will add ALL phases associated with the setTemplateId. For example:
 * - If setTemplateId = 2 (Drop Sets), it will add all 3 phases of the drop set
 * - If setTemplateId = 1 (Straight Sets), it will add just the single phase
 */
router.post('/add-set-to-split', async (req, res) => {
    // Get a client from the connection pool
    const client = await pool.connect();
    
    // Debug log to show the request was received
   
    
    try {
        // Start a database transaction
        // This ensures that either ALL of our database operations succeed or NONE of them do
        await client.query('BEGIN');

        // Extract all required fields from the request body
        const { userId, scheduledDate, setTemplateId, plannedBaseWeight, exerciseId } = req.body;

        // Input validation - make sure all required fields are present
        if (!userId || !scheduledDate || !setTemplateId || plannedBaseWeight === undefined || !exerciseId) {
           
            throw new Error('Missing required fields');
        }

       
        
        // First try to find if a workout plan already exists for this date
        let workoutPlanResult = await client.query(
            `SELECT id FROM user_workout_plans 
             WHERE user_id = $1 AND scheduled_date = $2`,
            [userId, scheduledDate]
        );

        let workoutPlanId;

        if (workoutPlanResult.rows.length === 0) {
            // If no workout plan exists for this date, create a new one
             
            const insertResult = await client.query(
                `INSERT INTO user_workout_plans (user_id, scheduled_date)
                 VALUES ($1, $2)
                 RETURNING id`,
                [userId, scheduledDate]
            );
            workoutPlanId = insertResult.rows[0].id;
 
        } else {
            // Use the existing workout plan
            workoutPlanId = workoutPlanResult.rows[0].id;
        }

        // Verify the exercise exists
        const exerciseCheck = await client.query(
            `SELECT id FROM exercises WHERE id = $1`,
            [exerciseId]
        );

        if (exerciseCheck.rows.length === 0) {
            throw new Error('Invalid exercise ID');
        }
        
        // Verify the set type exists
        const setTypeCheck = await client.query(
            `SELECT id FROM set_types WHERE id = $1`,
            [setTemplateId]
        );

        if (setTypeCheck.rows.length === 0) {
            throw new Error('Invalid set type ID');
        }

        // Now, get ALL template phases for this set type
        const phasesResult = await client.query(
            `SELECT id, phase_number, weight_modifier, target_rest_period_seconds 
             FROM set_type_templates 
             WHERE set_type_id = $1
             ORDER BY phase_number`,  // Order by phase number to keep proper sequence
            [setTemplateId]
        );

        if (phasesResult.rows.length === 0) {
            throw new Error('No template phases found for this set type');
        }

       
       

        // Array to store all inserted set IDs
        const insertedSetIds = [];

        // Add each phase of the set to the workout plan
        for (const phase of phasesResult.rows) {
            // Calculate actual weight for this phase based on modifier
            const phaseWeight = plannedBaseWeight * phase.weight_modifier;
            
           
           
            
            // Add the set phase to the plan with exercise ID and return its ID
            const setInsertResult = await client.query(
                `INSERT INTO user_workout_plan_sets 
                (user_workout_plan_id, set_type_template_id, planned_base_weight, exercise_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id`,
                [workoutPlanId, phase.id, phaseWeight, exerciseId]
            );
            
            const setId = setInsertResult.rows[0].id;
            insertedSetIds.push({
                setId: setId,
                phaseNumber: phase.phase_number,
                templateId: phase.id,
                weight: phaseWeight,
                restPeriod: phase.target_rest_period_seconds
            });
            
           
        }
        
        // Commit the transaction since everything succeeded
        await client.query('COMMIT');
        
        // Send a successful response with details of all inserted sets
       
        res.json({ 
            success: true, 
            message: `Added ${insertedSetIds.length} phases of ${setTypeCheck.rows[0].name} to workout plan`,
            workoutPlanId: workoutPlanId,
            setTemplateId: setTemplateId,
            exerciseId: exerciseId,
            baseWeight: plannedBaseWeight,
            sets: insertedSetIds
        });

    } catch (error) {
        // Rollback transaction on any error
        await client.query('ROLLBACK');
        
        console.error('Error adding set to split:', error);
        
        // Send appropriate error response based on the type of error
        if (error.message === 'Missing required fields') {
            res.status(400).json({ 
                success: false, 
                error: 'Missing required fields. Please provide userId, scheduledDate, setTemplateId, plannedBaseWeight, and exerciseId' 
            });
        } else if (error.message === 'Invalid set type ID') {
            res.status(400).json({ 
                success: false, 
                error: 'The provided set type ID does not exist' 
            });
        } else if (error.message === 'Invalid exercise ID') {
            res.status(400).json({ 
                success: false, 
                error: 'The provided exercise ID does not exist' 
            });
        } else if (error.message === 'No template phases found for this set type') {
            res.status(400).json({ 
                success: false, 
                error: 'No template phases found for the provided set type' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'An error occurred while adding the set to the workout plan',
                details: error.message
            });
        }
    } finally {
        // Always release the client back to the pool, even if an error occurred
        client.release();
       
    }
});

module.exports = router;