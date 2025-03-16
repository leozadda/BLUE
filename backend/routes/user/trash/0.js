const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * POST /create-user-split
 * Creates a new exercise set for a user's workout with enhanced frontend compatibility
 * 
 * Required fields:
 * - userId: The ID of the user creating the split
 * - exerciseId: Exercise ID from exercises table
 * - setTypeId: Set type ID from set_types table
 * - baseWeight: Starting weight for the exercise in user's preferred units
 * 
 * Returns:
 * - Complete exercise details including calculated target weights for each phase
 * - Set type template with rep ranges and rest periods
 * - Execution ID for tracking progress
 * - Frontend-ready data structures for charts and UI components
 */
router.post('/create-user-split', async (req, res) => {
    try {
        const { userId, exerciseId, setTypeId, baseWeight } = req.body;

        // Validate required fields
        if (!userId || !exerciseId || !setTypeId || baseWeight === undefined) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['userId', 'exerciseId', 'setTypeId', 'baseWeight']
            });
        }

        // Verify exercise exists
        const exerciseCheck = await pool.query(
            `SELECT id, name, equipment 
             FROM exercises 
             WHERE id = $1`,
            [exerciseId]
        );

        if (exerciseCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // Verify set type exists and get phases
        const setTypeCheck = await pool.query(
            `SELECT st.id, st.name, 
                    json_agg(json_build_object(
                        'phaseNumber', stt.phase_number,
                        'repRangeMin', stt.rep_range_min,
                        'repRangeMax', stt.rep_range_max,
                        'weightModifier', stt.weight_modifier,
                        'targetRestPeriodSeconds', stt.target_rest_period_seconds
                    ) ORDER BY stt.phase_number) as phases
             FROM set_types st
             JOIN set_type_templates stt ON st.id = stt.set_type_id
             WHERE st.id = $1
             GROUP BY st.id, st.name`,
            [setTypeId]
        );

        if (setTypeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Set type not found' });
        }

        // Get user preferences (metric/imperial)
        const userPrefsQuery = await pool.query(
            `SELECT metric_system FROM users WHERE id = $1`,
            [userId]
        );
        
        if (userPrefsQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const useMetric = userPrefsQuery.rows[0].metric_system;

        // Create the execution record
        const userSetExecution = await pool.query(
            `INSERT INTO user_set_executions 
             (user_id, set_type_id, exercise_id, base_weight, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING id, created_at`,
            [userId, setTypeId, exerciseId, baseWeight]
        );

        const executionId = userSetExecution.rows[0].id;

        // Get target muscle information
        const muscleTargets = await pool.query(
            `SELECT mg.id, mg.name, emt.effort_percentage
             FROM exercise_muscle_targets emt
             JOIN muscle_groups mg ON emt.muscle_group_id = mg.id
             WHERE emt.exercise_id = $1
             ORDER BY emt.effort_percentage DESC`,
            [exerciseId]
        );

        // Get current personal records for this exercise
        const personalRecords = await pool.query(
            `SELECT weight, reps, achieved_at
             FROM personal_record
             WHERE user_id = $1 AND exercise_id = $2
             ORDER BY weight DESC
             LIMIT 3`,
            [userId, exerciseId]
        );

        // Get recovery status for the primary muscle groups
        const primaryMuscle = muscleTargets.rows[0]?.name;
        let recoveryStatus = null;
        
        if (primaryMuscle) {
            const recoveryQuery = await pool.query(
                `SELECT recovery_status 
                 FROM bodypart 
                 WHERE name ILIKE $1`,
                [`%${primaryMuscle}%`]
            );
            
            if (recoveryQuery.rows.length > 0) {
                recoveryStatus = recoveryQuery.rows[0].recovery_status;
            }
        }

        // Format phases with frontend-ready data
        const phases = setTypeCheck.rows[0].phases.map(phase => {
            const targetWeight = baseWeight * phase.weightModifier;
            
            // Calculate plate breakdown for barbell exercises
            let plateBreakdown = null;
            if (exerciseCheck.rows[0].equipment === 'barbell') {
                plateBreakdown = calculatePlateBreakdown(targetWeight, useMetric);
            }
            
            return {
                ...phase,
                targetWeight: Math.round(targetWeight * 10) / 10, // Round to 1 decimal
                status: 'pending',
                plateBreakdown
            };
        });

        // Construct response with frontend-ready data
        const response = {
            executionId,
            exercise: {
                id: exerciseCheck.rows[0].id,
                name: exerciseCheck.rows[0].name,
                equipment: exerciseCheck.rows[0].equipment,
                targetMuscles: muscleTargets.rows.map(muscle => ({
                    id: muscle.id,
                    name: muscle.name,
                    effortPercentage: muscle.effort_percentage,
                    // Color code for frontend visualization
                    colorCode: getColorForMuscle(muscle.name)
                }))
            },
            setType: {
                id: setTypeCheck.rows[0].id,
                name: setTypeCheck.rows[0].name,
                phases
            },
            userPreferences: {
                useMetric
            },
            baseWeight,
            createdAt: userSetExecution.rows[0].created_at,
            personalRecords: personalRecords.rows,
            recoveryStatus,
            // Include data for chart visualization
            chartData: {
                strengthHistory: await getStrengthHistory(userId, exerciseId),
                volumeData: await getVolumeData(userId, primaryMuscle)
            },
            message: 'User split created successfully'
        };

        return res.status(201).json(response);

    } catch (error) {
        console.error('Error creating user split:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Calculate which plates to use for a barbell exercise
 * @param {number} targetWeight - The total weight including bar
 * @param {boolean} metric - Whether to use metric plates
 * @returns {Object} Plate configuration
 */
function calculatePlateBreakdown(targetWeight, metric) {
    const barWeight = metric ? 20 : 45; // kg or lbs
    let remainingWeight = targetWeight - barWeight;
    
    if (remainingWeight <= 0) return { barOnly: true };
    
    // Available plate sizes
    const plateOptions = metric ? 
        [25, 20, 15, 10, 5, 2.5, 1.25, 0.5] : 
        [45, 35, 25, 10, 5, 2.5];
    
    // Calculate plates needed for one side
    const plateCount = {};
    remainingWeight = remainingWeight / 2; // Split for each side
    
    plateOptions.forEach(plate => {
        const count = Math.floor(remainingWeight / plate);
        if (count > 0) {
            plateCount[plate] = count;
            remainingWeight -= plate * count;
        }
    });
    
    return {
        barWeight,
        plateConfiguration: plateCount,
        unaccountedWeight: remainingWeight > 0 ? Math.round(remainingWeight * 10) / 10 : 0
    };
}

/**
 * Get consistent color codes for muscle groups
 * @param {string} muscleName 
 * @returns {string} Color hex code
 */
function getColorForMuscle(muscleName) {
    const muscleColors = {
        'chest': '#FF5252',
        'back': '#536DFE',
        'legs': '#4CAF50',
        'shoulders': '#FFC107', 
        'arms': '#9C27B0',
        'core': '#00BCD4',
        'quads': '#8BC34A',
        'hamstrings': '#FF9800',
        'glutes': '#E91E63',
        'triceps': '#9575CD',
        'biceps': '#7986CB',
        'forearms': '#4DB6AC'
    };
    
    // Check if muscle name contains any of our known muscles
    for (const [key, color] of Object.entries(muscleColors)) {
        if (muscleName.toLowerCase().includes(key)) {
            return color;
        }
    }
    
    // Default color
    return '#78909C';
}

/**
 * Get strength history for an exercise to populate charts
 * @param {number} userId 
 * @param {number} exerciseId 
 * @returns {Array} Strength history data
 */
async function getStrengthHistory(userId, exerciseId) {
    try {
        const strengthQuery = await pool.query(
            `SELECT 
                TO_CHAR(completed_at, 'YYYY-MM-DD') as date,
                MAX(actual_weight) as weight
             FROM user_set_phase_executions uspe
             JOIN user_set_executions use ON uspe.user_set_execution_id = use.id
             WHERE use.user_id = $1 AND use.exercise_id = $2
                AND completed_at > NOW() - INTERVAL '3 months'
             GROUP BY date
             ORDER BY date ASC`,
            [userId, exerciseId]
        );
        
        return strengthQuery.rows;
    } catch (error) {
        console.error('Error getting strength history:', error);
        return [];
    }
}

/**
 * Get volume data for a muscle group to populate charts
 * @param {number} userId 
 * @param {string} muscleName 
 * @returns {Array} Volume data
 */
async function getVolumeData(userId, muscleName) {
    try {
        if (!muscleName) return [];
        
        // This query gets weekly volume for a specific muscle group
        const volumeQuery = await pool.query(
            `SELECT 
                TO_CHAR(DATE_TRUNC('week', uspe.completed_at), 'YYYY-MM-DD') as week_start,
                SUM(uspe.actual_reps * uspe.actual_weight * emt.effort_percentage) as volume
             FROM user_set_phase_executions uspe
             JOIN user_set_executions use ON uspe.user_set_execution_id = use.id
             JOIN exercise_muscle_targets emt ON use.exercise_id = emt.exercise_id
             JOIN muscle_groups mg ON emt.muscle_group_id = mg.id
             WHERE use.user_id = $1 
                AND mg.name ILIKE $2
                AND uspe.completed_at > NOW() - INTERVAL '3 months'
             GROUP BY week_start
             ORDER BY week_start ASC`,
            [userId, `%${muscleName}%`]
        );
        
        return volumeQuery.rows;
    } catch (error) {
        console.error('Error getting volume data:', error);
        return [];
    }
}

module.exports = router;