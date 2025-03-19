CREATE TABLE bodypart (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    current_strength DOUBLE PRECISION,
    last_trained TIMESTAMP WITHOUT TIME ZONE,
    recovery_status VARCHAR(20) CHECK (recovery_status IN ('fresh', 'recovering', 'fatigued'))
);




CREATE TABLE exercise_muscle_targets (
    id SERIAL PRIMARY KEY,
    exercise_id INT,
    muscle_group_id INT,
    effort_percentage DOUBLE PRECISION NOT NULL CHECK (effort_percentage >= 0 AND effort_percentage <= 100),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id) ON DELETE CASCADE
);




CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    equipment VARCHAR(255)
);




CREATE TABLE measurement (
    id SERIAL PRIMARY KEY,
    user_id INT,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    body_weight NUMERIC,
    arms NUMERIC,
    thighs NUMERIC,
    calves NUMERIC,
    waist NUMERIC,
    forearms NUMERIC,
    chest NUMERIC,
    FOREIGN KEY (user_id) REFERENCES users(id),
    CHECK (
        (body_weight IS NULL OR body_weight > 0) AND
        (arms IS NULL OR arms > 0) AND
        (thighs IS NULL OR thighs > 0) AND
        (calves IS NULL OR calves > 0) AND
        (waist IS NULL OR waist > 0) AND
        (forearms IS NULL OR forearms > 0) AND
        (chest IS NULL OR chest > 0)
    )
);




CREATE TABLE muscle_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name)
);



CREATE TABLE muscle_recovery_rates (
    muscle_group TEXT PRIMARY KEY,
    recovery_rate DOUBLE PRECISION
);




CREATE TABLE onboarding_steps (
    step VARCHAR(50) PRIMARY KEY
);





CREATE TABLE personal_record (
    id SERIAL PRIMARY KEY,
    user_id INT,
    exercise_id INT,
    weight DOUBLE PRECISION,
    reps INT,
    achieved_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);




CREATE TABLE progress_media (
    id SERIAL PRIMARY KEY,
    measurement_id INT,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('photo', 'video')),
    media_url TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (measurement_id) REFERENCES measurement(id) ON DELETE CASCADE
);




CREATE TABLE set_type_templates (
    id SERIAL PRIMARY KEY,
    set_type_id INT,
    phase_number INT NOT NULL,
    rep_range_min INT,
    rep_range_max INT,
    weight_modifier DOUBLE PRECISION NOT NULL,
    target_rest_period_seconds INT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (set_type_id) REFERENCES set_types(id) ON DELETE CASCADE,
    UNIQUE (set_type_id, phase_number)
);





CREATE TABLE set_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name)
);





CREATE TABLE user_onboarding_steps (
    id SERIAL PRIMARY KEY,
    user_id INT,
    step VARCHAR(50),
    completed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (step) REFERENCES onboarding_steps(step) ON DELETE CASCADE,
    UNIQUE (user_id, step)
);




CREATE TABLE user_set_executions (
    id SERIAL PRIMARY KEY,
    user_id INT,
    set_type_id INT,
    exercise_id INT,
    base_weight DOUBLE PRECISION,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (set_type_id) REFERENCES set_types(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);




CREATE TABLE user_set_phase_executions (
    id SERIAL PRIMARY KEY,
    user_set_execution_id INT,
    phase_number INT NOT NULL,
    actual_reps INT,
    actual_weight DOUBLE PRECISION,
    actual_rest_period_seconds INT,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    FOREIGN KEY (user_set_execution_id) REFERENCES user_set_executions(id),
    UNIQUE (user_set_execution_id, phase_number)
);




CREATE TABLE user_workout_plan_sets (
    id SERIAL PRIMARY KEY,
    user_workout_plan_id INT NOT NULL,
    set_type_template_id INT NOT NULL,
    planned_base_weight NUMERIC,
    exercise_id INT,
    FOREIGN KEY (user_workout_plan_id) REFERENCES user_workout_plans(id),
    FOREIGN KEY (set_type_template_id) REFERENCES set_type_templates(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);




CREATE TABLE user_workout_plans (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);




CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    google_auth BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    premium_status BOOLEAN DEFAULT FALSE,
    trial_started TIMESTAMP WITHOUT TIME ZONE,
    metric_system BOOLEAN DEFAULT TRUE,
    newsletter BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    trial_period_ends_at TIMESTAMP WITHOUT TIME ZONE,
    is_first_time_user BOOLEAN DEFAULT TRUE
);




INSERT INTO bodypart (id, name, current_strength, last_trained, recovery_status) VALUES
(1, 'Biceps', NULL, NULL, NULL),
(2, 'Triceps', NULL, NULL, NULL),
(3, 'Chest', NULL, NULL, NULL),
(4, 'Back', NULL, NULL, NULL),
(5, 'Quads', NULL, NULL, NULL),
(6, 'Hamstrings', NULL, NULL, NULL);




INSERT INTO exercise_muscle_targets (id, exercise_id, muscle_group_id, effort_percentage) VALUES
(1, 1, 1, 55),
(2, 1, 2, 20),
(3, 1, 3, 15),
(4, 1, 4, 10),
(9, 2, 1, 10),
(10, 2, 3, 15),
(11, 2, 2, 20),
(12, 2, 4, 55),
(13, 3, 3, 20),
(14, 3, 2, 20),
(15, 3, 5, 60),
(16, 4, 21, 10),
(17, 4, 3, 15),
(18, 4, 2, 20),
(19, 4, 1, 55),
(20, 5, 2, 20),
(21, 5, 3, 30),
(22, 5, 1, 50),
(23, 6, 8, 5),
(24, 6, 7, 10),
(25, 6, 3, 20),
(26, 6, 6, 25),
(27, 6, 2, 40),
(28, 7, 7, 10),
(29, 7, 3, 25),
(30, 7, 6, 30),
(31, 7, 2, 35),
(32, 8, 7, 10),
(33, 8, 3, 15),
(34, 8, 12, 10),
(35, 8, 6, 35),
(36, 8, 2, 30),
(37, 9, 12, 10),
(38, 9, 11, 20),
(39, 9, 10, 25),
(40, 9, 9, 45),
(41, 10, 12, 10),
(42, 10, 10, 20),
(43, 10, 11, 30),
(44, 10, 9, 40),
(45, 11, 11, 10),
(46, 11, 12, 10),
(47, 11, 7, 20),
(48, 11, 13, 25),
(49, 11, 9, 35),
(50, 12, 11, 10),
(51, 12, 12, 10),
(52, 12, 7, 20),
(53, 12, 13, 25),
(54, 12, 9, 35),
(55, 13, 11, 5),
(56, 13, 12, 10),
(57, 13, 7, 15),
(58, 13, 13, 30),
(59, 13, 9, 40),
(60, 14, 12, 10),
(61, 14, 11, 20),
(62, 14, 13, 30),
(63, 14, 9, 40),
(64, 15, 12, 10),
(65, 15, 11, 20),
(66, 15, 10, 25),
(67, 15, 9, 45),
(68, 16, 7, 15),
(69, 16, 13, 25),
(70, 16, 14, 25),
(71, 16, 12, 35),
(72, 17, 19, 5),
(73, 17, 18, 10),
(74, 17, 17, 15),
(75, 17, 16, 25),
(76, 17, 15, 45),
(77, 18, 10, 5),
(78, 18, 20, 10),
(79, 18, 19, 15),
(80, 18, 16, 20),
(81, 18, 15, 50),
(82, 19, 21, 5),
(83, 19, 18, 15),
(84, 19, 16, 30),
(85, 19, 15, 50),
(86, 20, 19, 10),
(87, 20, 18, 10),
(88, 20, 16, 20),
(89, 20, 15, 60),
(90, 21, 23, 5),
(91, 21, 7, 5),
(92, 21, 15, 10),
(93, 21, 18, 20),
(94, 21, 16, 25),
(95, 21, 19, 35),
(96, 22, 7, 10),
(97, 22, 19, 20),
(98, 22, 16, 30),
(99, 22, 18, 40),
(100, 23, 22, 10),
(101, 23, 19, 15),
(102, 23, 15, 20),
(103, 23, 18, 25),
(104, 23, 16, 30),
(105, 24, 17, 5),
(106, 24, 19, 10),
(107, 24, 18, 25),
(108, 24, 16, 60),
(109, 25, 17, 5),
(110, 25, 18, 15),
(111, 25, 16, 30),
(112, 25, 15, 50),
(113, 26, 21, 15),
(114, 26, 2, 15),
(115, 26, 1, 70),
(116, 27, 21, 15),
(117, 27, 2, 15),
(118, 27, 1, 70),
(119, 28, 2, 15),
(120, 28, 1, 75),
(121, 29, 7, 10),
(122, 29, 2, 15),
(123, 29, 6, 75),
(124, 30, 7, 10),
(125, 30, 10, 20),
(126, 30, 12, 70),
(127, 31, 3, 100),
(128, 32, 3, 100),
(129, 33, 3, 100),
(130, 34, 25, 10),
(131, 34, 24, 20),
(132, 34, 11, 70),
(133, 35, 25, 20),
(134, 35, 24, 30),
(135, 35, 11, 50),
(136, 36, 25, 5),
(137, 36, 24, 15),
(138, 36, 11, 80),
(139, 37, 25, 5),
(140, 37, 24, 20),
(141, 37, 11, 75),
(142, 38, 21, 15),
(143, 38, 15, 85),
(144, 39, 16, 15),
(145, 39, 18, 85),
(146, 40, 21, 10),
(147, 40, 29, 90),
(148, 41, 21, 10),
(149, 41, 29, 90),
(150, 42, 20, 100),
(151, 43, 27, 30),
(152, 43, 26, 70),
(153, 44, 28, 20),
(154, 44, 26, 80),
(155, 45, 26, 30),
(156, 45, 28, 70),
(157, 46, 19, 20),
(158, 46, 18, 40),
(159, 46, 16, 40),
(160, 47, 10, 10),
(161, 47, 7, 90),
(162, 48, 2, 20),
(163, 48, 7, 30),
(164, 48, 6, 50),
(165, 49, 7, 10),
(166, 49, 3, 25),
(167, 49, 6, 30),
(168, 49, 2, 35),
(169, 50, 3, 15),
(170, 50, 2, 25),
(171, 50, 1, 60);




INSERT INTO exercises (id, name, created_at, equipment) VALUES
(1, 'Barbell Bench Press', NOW(), 'Barbell'),
(2, 'Incline Barbell Bench Press', NOW(), 'Barbell'),
(3, 'Decline Barbell Bench Press', NOW(), 'Barbell'),
(6, 'Overhead Press', NOW(), 'Barbell'),
(11, 'Barbell Row', NOW(), 'Barbell'),
(17, 'Back Squat', NOW(), 'Barbell'),
(21, 'Conventional Deadlift', NOW(), 'Barbell'),
(22, 'Romanian Deadlift', NOW(), 'Barbell'),
(23, 'Sumo Deadlift', NOW(), 'Barbell'),
(4, 'Dumbbell Bench Press', NOW(), 'Dumbbells'),
(7, 'Dumbbell Shoulder Press', NOW(), 'Dumbbells'),
(8, 'Arnold Press', NOW(), 'Dumbbells'),
(12, 'Dumbbell Row', NOW(), 'Dumbbells'),
(26, 'Dumbbell Flyes', NOW(), 'Dumbbells'),
(32, 'Dumbbell Triceps Extension', NOW(), 'Dumbbells'),
(34, 'Dumbbell Curl', NOW(), 'Dumbbells'),
(35, 'Hammer Curl', NOW(), 'Dumbbells'),
(47, 'Dumbbell Shrug', NOW(), 'Dumbbells'),
(49, 'Seated Dumbbell Shoulder Press', NOW(), 'Dumbbells'),
(14, 'Seated Cable Row', NOW(), 'Cable Machine'),
(15, 'Lat Pulldown', NOW(), 'Cable Machine'),
(16, 'Face Pull', NOW(), 'Cable Machine'),
(27, 'Cable Flyes', NOW(), 'Cable Machine'),
(29, 'Cable Lateral Raise', NOW(), 'Cable Machine'),
(33, 'Cable Triceps Pushdown', NOW(), 'Cable Machine'),
(44, 'Cable Crunch', NOW(), 'Cable Machine'),
(13, 'T-Bar Row', NOW(), 'Machine'),
(20, 'Hack Squat', NOW(), 'Machine'),
(25, 'Leg Press', NOW(), 'Machine'),
(28, 'Pec Deck Machine', NOW(), 'Machine'),
(38, 'Leg Extensions', NOW(), 'Machine'),
(39, 'Leg Curls', NOW(), 'Machine'),
(50, 'Machine Chest Press', NOW(), 'Machine'),
(5, 'Chest Dips', NOW(), 'Bodyweight'),
(9, 'Pull-up', NOW(), 'Bodyweight'),
(10, 'Chin-up', NOW(), 'Bodyweight'),
(42, 'Plank', NOW(), 'Bodyweight'),
(43, 'Hanging Leg Raise', NOW(), 'Bodyweight'),
(45, 'Russian Twist', NOW(), 'Bodyweight'),
(24, 'Hip Thrust', NOW(), 'Hip Thrust Machine'),
(46, 'Glute Ham Raise', NOW(), 'Glute Ham Developer'),
(19, 'Bulgarian Split Squat', NOW(), 'Barbell'),
(30, 'Rear Delt Fly', NOW(), 'Cable'),
(36, 'Preacher Curl', NOW(), 'Dumbbells'),
(37, 'Concentration Curl', NOW(), 'Dumbbells'),
(48, 'Upright Row', NOW(), 'Dumbbells'),
(40, 'Standing Calf Raise', NOW(), 'Machine'),
(41, 'Seated Calf Raise', NOW(), 'Machine'),
(18, 'Front Squat', NOW(), 'Other'),
(31, 'Skull Crusher', NOW(), 'Other'),
(100, 'Test Bench Press', NOW(), 'Barbell')
ON CONFLICT (id) DO NOTHING;





INSERT INTO muscle_groups (id, name, created_at) VALUES
(1, 'Chest', NOW()),
(2, 'Front Delts', NOW()),
(3, 'Triceps', NOW()),
(4, 'Upper Chest', NOW()),
(5, 'Lower Chest', NOW()),
(6, 'Side Delts', NOW()),
(7, 'Traps', NOW()),
(8, 'Serratus', NOW()),
(9, 'Back', NOW()),
(10, 'Upper Back', NOW()),
(11, 'Biceps', NOW()),
(12, 'Rear Delts', NOW()),
(13, 'Middle Back', NOW()),
(14, 'Rotator Cuff', NOW()),
(15, 'Quads', NOW()),
(16, 'Glutes', NOW()),
(17, 'Inner Thighs', NOW()),
(18, 'Hamstrings', NOW()),
(19, 'Lower Back', NOW()),
(20, 'Core', NOW()),
(21, 'Stabilizers', NOW()),
(22, 'Adductors', NOW()),
(23, 'Lats', NOW()),
(24, 'Brachialis', NOW()),
(25, 'Forearms', NOW()),
(26, 'Abs', NOW()),
(27, 'Hip Flexors', NOW()),
(28, 'Obliques', NOW()),
(29, 'Calves', NOW())
ON CONFLICT (id) DO NOTHING;




INSERT INTO muscle_recovery_rates (muscle_group, recovery_rate) VALUES
('biceps', 0.06),
('triceps', 0.06),
('chest', 0.05),
('back', 0.04),
('quads', 0.03),
('hamstrings', 0.03),
('Front Delts', 0.06),
('Upper Chest', 0.05),
('Lower Chest', 0.05),
('Side Delts', 0.06),
('Traps', 0.05),
('Serratus', 0.07),
('Upper Back', 0.04),
('Rear Delts', 0.06),
('Middle Back', 0.04),
('Rotator Cuff', 0.07),
('Glutes', 0.03),
('Inner Thighs', 0.04),
('Lower Back', 0.04),
('Core', 0.07),
('Stabilizers', 0.07),
('Adductors', 0.04),
('Lats', 0.04),
('Brachialis', 0.06),
('Forearms', 0.06),
('Abs', 0.07),
('Hip Flexors', 0.06),
('Obliques', 0.07),
('Calves', 0.06)
ON CONFLICT (muscle_group) DO NOTHING;



INSERT INTO onboarding_steps (step) VALUES
('welcome'),
('split_creation'),
('try_workout'),
('view_analytics'),
('next_steps')
ON CONFLICT (step) DO NOTHING;


INSERT INTO set_type_templates (
  id, 
  set_type_id, 
  phase_number, 
  rep_range_min, 
  rep_range_max, 
  weight_modifier, 
  target_rest_period_seconds, 
  created_at
) VALUES
(1, 1, 1, 8, 12, 1, 90, NOW()),
(2, 2, 1, 8, 12, 1, 0, NOW()),
(3, 2, 2, 8, 12, 0.8, 0, NOW()),
(4, 2, 3, 8, 12, 0.6, 90, NOW()),
(5, 3, 1, 8, 12, 1, 0, NOW()),
(6, 3, 2, 8, 12, 1, 90, NOW()),
(7, 4, 1, 10, 15, 1, 0, NOW()),
(8, 4, 2, 10, 15, 1, 0, NOW()),
(9, 4, 3, 10, 15, 1, 0, NOW()),
(10, 4, 4, 10, 15, 1, 90, NOW()),
(11, 5, 1, 12, 15, 0.8, 60, NOW()),
(12, 5, 2, 8, 12, 1, 60, NOW()),
(13, 5, 3, 6, 8, 1.2, 60, NOW()),
(14, 6, 1, 10, 15, 1, 15, NOW()),
(15, 6, 2, 5, 8, 1, 60, NOW()),
(16, 7, 1, 2, 3, 1, 15, NOW()),
(17, 7, 2, 2, 3, 1, 15, NOW()),
(18, 7, 3, 2, 3, 1, 15, NOW()),
(19, 7, 4, 2, 3, 1, 15, NOW()),
(20, 8, 1, 10, 15, 1, 0, NOW()),
(21, 8, 2, 10, 15, 1, 0, NOW()),
(22, 8, 3, 10, 15, 1, 90, NOW()),
(23, 9, 1, 12, 15, 0.5, 0, NOW()),
(24, 9, 2, 8, 12, 1, 90, NOW()),
(25, 10, 1, 6, 10, 1, 90, NOW())
ON CONFLICT (id) DO NOTHING;



INSERT INTO set_types (id, name, created_at) VALUES
(1, 'Straight Sets', NOW()),
(2, 'Drop Sets', NOW()),
(3, 'Super Sets', NOW()),
(4, 'Giant Sets', NOW()),
(5, 'Pyramid Sets', NOW()),
(6, 'Rest-Pause Sets', NOW()),
(7, 'Cluster Sets', NOW()),
(8, 'Mechanical Drop Sets', NOW()),
(9, 'Pre-Exhaust Sets', NOW()),
(10, 'Time Under Tension (TUT)', NOW())
ON CONFLICT (id) DO NOTHING;



INSERT INTO user_onboarding_steps (id, user_id, step, completed_at) VALUES
(1, 33, 'welcome', NOW()),
(3, 33, 'split_creation', NOW()),
(4, 33, 'try_workout', NOW()),
(5, 33, 'view_analytics', NOW()),
(6, 33, 'next_steps', NOW()),
(412, 20, 'welcome', NOW()),
(413, 20, 'split_creation', NOW()),
(414, 20, 'try_workout', NOW()),
(415, 20, 'view_analytics', NOW()),
(416, 20, 'next_steps', NOW())
ON CONFLICT (id) DO NOTHING;




