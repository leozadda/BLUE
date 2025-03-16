const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

router.get('/get-strength-history', async (req, res) => {
  try {
    // Assume you have middleware that sets req.user, e.g. from a JWT token.
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = `
      WITH execution_data AS (
        SELECT 
          use.user_id,
          use.created_at,
          mg.name AS body_part,
          use.base_weight * (emt.effort_percentage / 100.0) AS effective_weight
        FROM user_set_executions use
        JOIN exercise_muscle_targets emt 
          ON use.exercise_id = emt.exercise_id
        JOIN muscle_groups mg 
          ON mg.id = emt.muscle_group_id
        WHERE use.user_id = $1
      )
      -- Daily aggregation for the past week (including today and 6 days before)
      SELECT
        'day' AS period_type,
        date_trunc('day', created_at) AS period,
        body_part,
        SUM(effective_weight) AS total_effective_weight
      FROM execution_data
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY period, body_part

      UNION ALL

      -- Weekly aggregation for the past 4 weeks
      SELECT
        'week' AS period_type,
        date_trunc('week', created_at) AS period,
        body_part,
        SUM(effective_weight) AS total_effective_weight
      FROM execution_data
      WHERE created_at >= CURRENT_DATE - INTERVAL '4 weeks'
      GROUP BY period, body_part

      UNION ALL

      -- Monthly aggregation for the past 12 months
      SELECT
        'month' AS period_type,
        date_trunc('month', created_at) AS period,
        body_part,
        SUM(effective_weight) AS total_effective_weight
      FROM execution_data
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY period, body_part
      ORDER BY period_type, period, body_part;
    `;

    // Execute the query with the userId as a parameter.
    const { rows } = await pool.query(query, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('Error executing strength history query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
