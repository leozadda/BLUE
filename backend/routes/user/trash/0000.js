const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * GET /get-user-split
 * Retrieves all exercises and their progress for a specific date
 */
router.get('/get-user-split', async (req, res) => {
    try {
        const { userId, date } = req.query;

        if (!userId || !date) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                required: ['userId', 'date']
            });
        }

        const exercises = await pool.query(`
            WITH execution_details AS (
                SELECT 
                    use.id as execution_id,
                    use.exercise_id,
                    use.set_type_id,
                    use.base_weight,
                    use.created_at,
                    e.name as exercise_name,
                    e.equipment,
                    st.name as set_type_name,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', mg.id,
                                'name', mg.name,
                                'effortPercentage', emt.effort_percentage
                            )
                        ) FILTER (WHERE mg.id IS NOT NULL), 
                        '[]'::json
                    ) as target_muscles,
                    COALESCE(
                        json_agg(
                            DISTINCT jsonb_build_object(
                                'phaseNumber', stt.phase_number,
                                'repRangeMin', stt.rep_range_min,
                                'repRangeMax', stt.rep_range_max,
                                'weightModifier', stt.weight_modifier,
                                'targetRestPeriodSeconds', stt.target_rest_period_seconds,
                                'targetWeight', use.base_weight * stt.weight_modifier
                            )
                        ) FILTER (WHERE stt.phase_number IS NOT NULL),
                        '[]'::json
                    ) as target_phases,
                    COALESCE(
                        json_agg(
                            DISTINCT jsonb_build_object(
                                'phaseNumber', uspe.phase_number,
                                'actualReps', uspe.actual_reps,
                                'actualWeight', uspe.actual_weight,
                                'actualRestPeriodSeconds', uspe.actual_rest_period_seconds,
                                'completedAt', uspe.completed_at
                            )
                        ) FILTER (WHERE uspe.phase_number IS NOT NULL),
                        '[]'::json
                    ) as completed_phases,
                    COUNT(DISTINCT stt.phase_number) as total_phases,
                    COUNT(DISTINCT uspe.phase_number) as completed_phase_count
                FROM user_set_executions use
                JOIN exercises e ON use.exercise_id = e.id
                JOIN set_types st ON use.set_type_id = st.id
                LEFT JOIN exercise_muscle_targets emt ON e.id = emt.exercise_id
                LEFT JOIN muscle_groups mg ON emt.muscle_group_id = mg.id
                LEFT JOIN set_type_templates stt ON st.id = stt.set_type_id
                LEFT JOIN user_set_phase_executions uspe ON use.id = uspe.user_set_execution_id
                WHERE use.user_id = $1 
                AND DATE(use.created_at) = DATE($2)
                GROUP BY 
                    use.id,
                    use.exercise_id,
                    use.set_type_id,
                    use.base_weight,
                    use.created_at,
                    e.name,
                    e.equipment,
                    st.name
            )
            SELECT 
                execution_id,
                exercise_id,
                set_type_id,
                base_weight,
                created_at,
                exercise_name,
                equipment,
                set_type_name,
                target_muscles,
                target_phases,
                completed_phases,
                (CASE 
                    WHEN total_phases > 0 AND total_phases = completed_phase_count 
                    THEN true 
                    ELSE false 
                END) as is_completed
            FROM execution_details
            ORDER BY created_at
        `, [userId, date]);

        const transformedData = exercises.rows.map(row => ({
            executionId: row.execution_id,
            exercise: {
                id: row.exercise_id,
                name: row.exercise_name,
                equipment: row.equipment,
                targetMuscles: row.target_muscles
            },
            setType: {
                id: row.set_type_id,
                name: row.set_type_name,
                phases: row.target_phases.map(targetPhase => {
                    const completedPhase = row.completed_phases.find(
                        cp => cp.phaseNumber === targetPhase.phaseNumber
                    );
                    return {
                        ...targetPhase,
                        ...completedPhase,
                        status: completedPhase ? 'completed' : 'pending'
                    };
                })
            },
            baseWeight: row.base_weight,
            isCompleted: row.is_completed,
            createdAt: row.created_at
        }));

        return res.status(200).json(transformedData);

    } catch (error) {
        console.error('Error fetching user day split:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;