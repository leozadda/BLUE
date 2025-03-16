// ================ SEARCH FOR EXERCISE (routes/workout/SearchForExercise.js) ================
const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * Searches for exercises and their muscle targets
 * GET /search-for-exercise
 * 
 * Query parameters:
 * - searchTerm (optional): string to search for in exercise name
 * - equipment (optional): filter by equipment type
 * 
 * Returns exercises with grouped muscle targets:
 * {
 *   "id": 1,
 *   "name": "Bench Press",
 *   "equipment": "Barbell",
 *   "muscleTargets": [
 *     { "muscle": "Chest", "percentage": 55 },
 *     { "muscle": "Front Delts", "percentage": 20 }
 *   ]
 * }
 */
router.get('/search-for-exercise', async (req, res) => {
    try {
        const { searchTerm, equipment } = req.query;
        let query = `
            SELECT 
                exercises.id, 
                exercises.name, 
                exercises.equipment, 
                json_agg(
                    json_build_object(
                        'muscle', muscle_groups.name,
                        'percentage', exercise_muscle_targets.effort_percentage
                    )
                    ORDER BY exercise_muscle_targets.effort_percentage DESC
                ) as muscle_targets
            FROM exercises
            INNER JOIN exercise_muscle_targets
                ON exercises.id = exercise_muscle_targets.exercise_id
            INNER JOIN muscle_groups
                ON exercise_muscle_targets.muscle_group_id = muscle_groups.id
            WHERE 1=1
        `;
        const params = [];

        if (searchTerm) {
            params.push(`%${searchTerm}%`);
            query += ` AND exercises.name ILIKE $${params.length}`;
        }

        if (equipment) {
            params.push(equipment);
            query += ` AND exercises.equipment = $${params.length}`;
        }

        // Add GROUP BY to combine muscle targets for each exercise
        query += `
            GROUP BY 
                exercises.id, 
                exercises.name, 
                exercises.equipment
            ORDER BY 
                exercises.name
        `;

        const result = await pool.query(query, params);

        // Format the response
        const exercises = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            equipment: row.equipment,
            muscleTargets: row.muscle_targets
        }));

        res.json({ 
            success: true, 
            exercises: exercises 
        });

    } catch (error) {
        console.error('Error searching exercises:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error occurred while searching exercises',
            details: error.message 
        });
    }
});

module.exports = router;