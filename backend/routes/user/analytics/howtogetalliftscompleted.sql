`SELECT 
  user_set_executions.id AS execution_id,
  user_set_executions.user_id,
  user_set_executions.set_type_id,
  user_set_executions.exercise_id,
  user_set_executions.base_weight,
  user_set_executions.created_at AS execution_created_at,
  user_set_phase_executions.phase_number,
  user_set_phase_executions.actual_reps,
  user_set_phase_executions.actual_weight,
  user_set_phase_executions.actual_rest_period_seconds,
  user_set_phase_executions.completed_at AS phase_completed_at
FROM user_set_executions
LEFT JOIN user_set_phase_executions 
  ON user_set_executions.id = user_set_phase_executions.user_set_execution_id;`
  //you have to change all of your API's