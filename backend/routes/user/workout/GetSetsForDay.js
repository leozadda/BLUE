// ================ GET SETS FOR DAY (routes/workout/GetSetsForDay.js) ================
const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * Gets all planned sets for a specific day from the workout plan
 * This endpoint retrieves the complete workout schedule for a given user on a specific date
 * including exercise names, equipment, and all set parameters
 * 
 * Endpoint: GET /get-sets-for-day
 * 
 * Query parameters:
 * - userId: number - The unique identifier of the user
 * - date: YYYY-MM-DD - The date to get workout sets for
 * 
 * Database tables used:
 * - user_workout_plans: Contains the main workout plan entries
 * - user_workout_plan_sets: Contains the specific sets planned with exercise links
 * - set_type_templates: Contains the template for how each set should be performed
 * - set_types: Contains the basic set type definitions
 * - exercises: Contains the exercise names and equipment needed
 * - exercise_muscle_targets: Links exercises to muscle groups (optional join)
 * - muscle_groups: Contains muscle group names (optional join)
 * 
 * Returns:
 * - success: boolean
 * - sets: array of workout sets with complete details including exercise info
 */
router.get('/get-sets-for-day', async (req, res) => {
    try {
        const { userId, date } = req.query;
        
        // Log incoming request parameters
       

        // Validate input parameters
        if (!userId || !date) {
            console.error('Missing required parameters - userId:', userId, 'date:', date);
            return res.status(400).json({ success: false, error: 'Missing required parameters' });
        }

        // Log SQL query execution
       

        const result = await pool.query(
            `SELECT 
                user_workout_plans.id AS plan_id,
                user_workout_plans.user_id,
                user_workout_plans.scheduled_date,
                user_workout_plan_sets.id AS set_id,
                user_workout_plan_sets.planned_base_weight,
                user_workout_plan_sets.exercise_id,
                exercises.name AS exercise_name,
                exercises.equipment,
                set_type_templates.id AS template_id,
                set_type_templates.phase_number,
                set_type_templates.rep_range_min,
                set_type_templates.rep_range_max,
                set_type_templates.weight_modifier,
                set_type_templates.target_rest_period_seconds,
                set_types.id AS set_type_id,
                set_types.name AS set_type_name,
                array_agg(DISTINCT muscle_groups.name) FILTER (WHERE muscle_groups.name IS NOT NULL) AS targeted_muscles
             FROM user_workout_plans
             INNER JOIN user_workout_plan_sets
                ON user_workout_plans.id = user_workout_plan_sets.user_workout_plan_id
             INNER JOIN set_type_templates
                ON user_workout_plan_sets.set_type_template_id = set_type_templates.id
             INNER JOIN set_types
                ON set_type_templates.set_type_id = set_types.id
             INNER JOIN exercises
                ON user_workout_plan_sets.exercise_id = exercises.id
             LEFT JOIN exercise_muscle_targets
                ON exercises.id = exercise_muscle_targets.exercise_id
             LEFT JOIN muscle_groups
                ON exercise_muscle_targets.muscle_group_id = muscle_groups.id
             WHERE user_workout_plans.user_id = $1 
             AND user_workout_plans.scheduled_date = $2
             GROUP BY 
                user_workout_plans.id,
                user_workout_plans.user_id,
                user_workout_plans.scheduled_date,
                user_workout_plan_sets.id,
                user_workout_plan_sets.planned_base_weight,
                user_workout_plan_sets.exercise_id,
                exercises.name,
                exercises.equipment,
                set_type_templates.id,
                set_type_templates.phase_number,
                set_type_templates.rep_range_min,
                set_type_templates.rep_range_max,
                set_type_templates.weight_modifier,
                set_type_templates.target_rest_period_seconds,
                set_types.id,
                set_types.name
             ORDER BY set_type_templates.phase_number`,
            [userId, date]
        );

        // Log query results
       
        
        // Process the results to organize by exercise and set type
        const organizedWorkout = organizeWorkoutData(result.rows);

        res.json({ 
            success: true, 
            sets: result.rows,
            organizedWorkout: organizedWorkout
        });
    } catch (error) {
        // Log detailed error information
        console.error('Error getting sets for day:', error);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Helper function to organize raw workout data into a more structured format
 * Groups sets by exercise and organizes phases within each set
 * 
 * @param {Array} rows - Raw database query results
 * @returns {Object} - Organized workout data grouped by exercise
 */
function organizeWorkoutData(rows) {
    // Group exercises
    const exerciseMap = {};
    
    rows.forEach(row => {
        const exerciseId = row.exercise_id;
        
        // Create exercise entry if it doesn't exist
        if (!exerciseMap[exerciseId]) {
            exerciseMap[exerciseId] = {
                exerciseId: exerciseId,
                exerciseName: row.exercise_name,
                equipment: row.equipment,
                targetedMuscles: row.targeted_muscles || [],
                sets: []
            };
        }
        
        // Add set information
        exerciseMap[exerciseId].sets.push({
            setId: row.set_id,
            setTypeName: row.set_type_name,
            setTypeId: row.set_type_id,
            templateId: row.template_id,
            phaseNumber: row.phase_number,
            plannedBaseWeight: row.planned_base_weight,
            repRangeMin: row.rep_range_min,
            repRangeMax: row.rep_range_max,
            weightModifier: row.weight_modifier,
            targetRestPeriodSeconds: row.target_rest_period_seconds,
            // Calculate actual weight based on base weight and modifier
            calculatedWeight: Math.round(row.planned_base_weight * row.weight_modifier)
        });
    });
    
    // Convert to array and sort sets by phase within each exercise
    const exercises = Object.values(exerciseMap);
    exercises.forEach(exercise => {
        exercise.sets.sort((a, b) => a.phaseNumber - b.phaseNumber);
    });
    
    return {
        date: rows.length > 0 ? rows[0].scheduled_date : null,
        userId: rows.length > 0 ? rows[0].user_id : null,
        planId: rows.length > 0 ? rows[0].plan_id : null,
        exercises: exercises
    };
}

module.exports = router;