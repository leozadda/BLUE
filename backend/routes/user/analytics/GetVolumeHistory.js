const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

// Route matches what's registered in server.js
router.get('/muscle-volume-history', async (req, res) => {
  try {
    // Get the userId from req.user
    // Since VerifyToken sets req.user with id from decoded.userId or decoded.id
    const userId = req.user && (req.user.userId || req.user.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: no user ID in token' });
    }

    const query = `
      WITH execution_data AS (
        SELECT 
          use.user_id,
          uspe.completed_at AS executed_at,
          mg.name AS body_part,
          use.base_weight * (emt.effort_percentage / 100.0) * uspe.actual_reps AS effective_volume
        FROM user_set_executions use
        JOIN user_set_phase_executions uspe 
          ON use.id = uspe.user_set_execution_id
        JOIN exercise_muscle_targets emt 
          ON use.exercise_id = emt.exercise_id
        JOIN muscle_groups mg 
          ON mg.id = emt.muscle_group_id
        WHERE use.user_id = $1
      )
      -- Daily aggregation for the past week (today and previous 6 days)
      SELECT
        'day' AS period_type,
        date_trunc('day', executed_at) AS period,
        body_part,
        SUM(effective_volume) AS net_total_volume
      FROM execution_data
      WHERE executed_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY period, body_part

      UNION ALL

      -- Weekly aggregation for the past 4 weeks
      SELECT
        'week' AS period_type,
        date_trunc('week', executed_at) AS period,
        body_part,
        SUM(effective_volume) AS net_total_volume
      FROM execution_data
      WHERE executed_at >= CURRENT_DATE - INTERVAL '4 weeks'
      GROUP BY period, body_part

      UNION ALL

      -- Monthly aggregation for the past 12 months
      SELECT
        'month' AS period_type,
        date_trunc('month', executed_at) AS period,
        body_part,
        SUM(effective_volume) AS net_total_volume
      FROM execution_data
      WHERE executed_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY period, body_part
      ORDER BY period_type, period, body_part;
    `;

    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error executing volume history query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;