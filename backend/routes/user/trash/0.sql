-- Set types table remains similar
CREATE TABLE set_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Updated set_phases table to store templates
CREATE TABLE set_type_templates (
    id SERIAL PRIMARY KEY,
    set_type_id INTEGER REFERENCES set_types(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    rep_range_min INTEGER,
    rep_range_max INTEGER,
    weight_modifier FLOAT NOT NULL,
    target_rest_period_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(set_type_id, phase_number)
);

-- This is where actual user sets are stored
CREATE TABLE user_set_executions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "users"(id),
    set_type_id INTEGER REFERENCES set_types(id),
    exercise_id INTEGER REFERENCES exercises(id),
    base_weight FLOAT,  -- The weight used for phase 1
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- This stores the actual performance for each phase
CREATE TABLE user_set_phase_executions (
    id SERIAL PRIMARY KEY,
    user_set_execution_id INTEGER REFERENCES user_set_executions(id),
    phase_number INTEGER NOT NULL,
    actual_reps INTEGER,
    actual_weight FLOAT,
    actual_rest_period_seconds INTEGER,
    completed_at TIMESTAMP,
    UNIQUE(user_set_execution_id, phase_number)
);