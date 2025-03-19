blue=# -- To list all tables and their columns:
SELECT table_schema, table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
 table_schema |        table_name         |        column_name         |          data_type          
--------------+---------------------------+----------------------------+-----------------------------
 public       | bodypart                  | id                         | integer
 public       | bodypart                  | name                       | character varying
 public       | bodypart                  | current_strength           | double precision
 public       | bodypart                  | last_trained               | timestamp without time zone
 public       | bodypart                  | recovery_status            | character varying
 public       | exercise_muscle_targets   | id                         | integer
 public       | exercise_muscle_targets   | exercise_id                | integer
 public       | exercise_muscle_targets   | muscle_group_id            | integer
 public       | exercise_muscle_targets   | effort_percentage          | double precision
 public       | exercises                 | id                         | integer
 public       | exercises                 | name                       | character varying
 public       | exercises                 | created_at                 | timestamp without time zone
 public       | exercises                 | equipment                  | character varying
 public       | measurement               | id                         | integer
 public       | measurement               | user_id                    | integer
 public       | measurement               | date                       | timestamp without time zone
 public       | measurement               | created_at                 | timestamp without time zone
 public       | measurement               | body_weight                | numeric
 public       | measurement               | arms                       | numeric
 public       | measurement               | thighs                     | numeric
 public       | measurement               | calves                     | numeric
 public       | measurement               | waist                      | numeric
 public       | measurement               | forearms                   | numeric
 public       | measurement               | chest                      | numeric
 public       | muscle_groups             | id                         | integer
 public       | muscle_groups             | name                       | character varying
 public       | muscle_groups             | created_at                 | timestamp without time zone
 public       | muscle_recovery_rates     | muscle_group               | text
 public       | muscle_recovery_rates     | recovery_rate              | double precision
 public       | onboarding_steps          | step                       | character varying
 public       | personal_record           | id                         | integer
 public       | personal_record           | user_id                    | integer
 public       | personal_record           | exercise_id                | integer
 public       | personal_record           | weight                     | double precision
 public       | personal_record           | reps                       | integer
 public       | personal_record           | achieved_at                | timestamp without time zone
 public       | progress_media            | id                         | integer
 public       | progress_media            | measurement_id             | integer
 public       | progress_media            | media_type                 | character varying
 public       | progress_media            | media_url                  | text
 public       | progress_media            | created_at                 | timestamp without time zone
 public       | set_type_templates        | id                         | integer
 public       | set_type_templates        | set_type_id                | integer
 public       | set_type_templates        | phase_number               | integer
 public       | set_type_templates        | rep_range_min              | integer
 public       | set_type_templates        | rep_range_max              | integer
 public       | set_type_templates        | weight_modifier            | double precision
 public       | set_type_templates        | target_rest_period_seconds | integer
 public       | set_type_templates        | created_at                 | timestamp without time zone
 public       | set_types                 | id                         | integer
 public       | set_types                 | name                       | character varying
 public       | set_types                 | created_at                 | timestamp without time zone
 public       | user_onboarding_steps     | id                         | integer
 public       | user_onboarding_steps     | user_id                    | integer
 public       | user_onboarding_steps     | step                       | character varying
 public       | user_onboarding_steps     | completed_at               | timestamp without time zone
 public       | user_set_executions       | id                         | integer
 public       | user_set_executions       | user_id                    | integer
 public       | user_set_executions       | set_type_id                | integer
 public       | user_set_executions       | exercise_id                | integer
 public       | user_set_executions       | base_weight                | double precision
 public       | user_set_executions       | created_at                 | timestamp without time zone
 public       | user_set_phase_executions | id                         | integer
 public       | user_set_phase_executions | user_set_execution_id      | integer
 public       | user_set_phase_executions | phase_number               | integer
 public       | user_set_phase_executions | actual_reps                | integer
 public       | user_set_phase_executions | actual_weight              | double precision
 public       | user_set_phase_executions | actual_rest_period_seconds | integer
 public       | user_set_phase_executions | completed_at               | timestamp without time zone
 public       | user_workout_plan_sets    | id                         | integer
 public       | user_workout_plan_sets    | user_workout_plan_id       | integer
 public       | user_workout_plan_sets    | set_type_template_id       | integer
 public       | user_workout_plan_sets    | planned_base_weight        | numeric
 public       | user_workout_plan_sets    | exercise_id                | integer
 public       | user_workout_plans        | id                         | integer
 public       | user_workout_plans        | user_id                    | integer
 public       | user_workout_plans        | scheduled_date             | date
 public       | user_workout_plans        | created_at                 | timestamp without time zone
 public       | users                     | id                         | integer
 public       | users                     | email                      | character varying
 public       | users                     | password_hash              | character varying
 public       | users                     | google_auth                | boolean
 public       | users                     | created_at                 | timestamp without time zone
 public       | users                     | premium_status             | boolean
 public       | users                     | trial_started              | timestamp without time zone
 public       | users                     | metric_system              | boolean
 public       | users                     | newsletter                 | boolean
 public       | users                     | active                     | boolean
 public       | users                     | trial_period_ends_at       | timestamp without time zone
 public       | users                     | is_first_time_user         | boolean
(90 rows)

blue=# \dt
            List of relations
 Schema |           Name            | Type  |  Owner   
--------+---------------------------+-------+----------
 public | bodypart                  | table | postgres
 public | exercise_muscle_targets   | table | postgres
 public | exercises                 | table | postgres
 public | measurement               | table | postgres
 public | muscle_groups             | table | postgres
 public | muscle_recovery_rates     | table | postgres
 public | onboarding_steps          | table | postgres
 public | personal_record           | table | postgres
 public | progress_media            | table | postgres
 public | set_type_templates        | table | postgres
 public | set_types                 | table | postgres
 public | user_onboarding_steps     | table | postgres
 public | user_set_executions       | table | postgres
 public | user_set_phase_executions | table | postgres
 public | user_workout_plan_sets    | table | postgres
 public | user_workout_plans        | table | postgres
 public | users                     | table | postgres
(17 rows)


blue=# SELECT tc.table_name, kcu.column_name, 
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
        table_name         |      column_name      | foreign_table_name  | foreign_column_name 
---------------------------+-----------------------+---------------------+---------------------
 measurement               | user_id               | users               | id
 personal_record           | user_id               | users               | id
 progress_media            | measurement_id        | measurement         | id
 exercise_muscle_targets   | exercise_id           | exercises           | id
 exercise_muscle_targets   | muscle_group_id       | muscle_groups       | id
 set_type_templates        | set_type_id           | set_types           | id
 user_set_executions       | user_id               | users               | id
 user_set_executions       | set_type_id           | set_types           | id
 user_set_executions       | exercise_id           | exercises           | id
 user_set_phase_executions | user_set_execution_id | user_set_executions | id
 user_workout_plan_sets    | user_workout_plan_id  | user_workout_plans  | id
 user_workout_plan_sets    | set_type_template_id  | set_type_templates  | id
 user_workout_plan_sets    | exercise_id           | exercises           | id
 user_onboarding_steps     | user_id               | users               | id
 user_onboarding_steps     | step                  | onboarding_steps    | step
(15 rows)


blue=# SELECT * FROM pg_indexes WHERE schemaname = 'public';
 schemaname |         tablename         |                            indexname                            | tablespace |                                                                                 indexdef                                                                                  
------------+---------------------------+-----------------------------------------------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 public     | users                     | user_pkey                                                       |            | CREATE UNIQUE INDEX user_pkey ON public.users USING btree (id)
 public     | users                     | user_email_key                                                  |            | CREATE UNIQUE INDEX user_email_key ON public.users USING btree (email)
 public     | personal_record           | personal_record_pkey                                            |            | CREATE UNIQUE INDEX personal_record_pkey ON public.personal_record USING btree (id)
 public     | bodypart                  | bodypart_pkey                                                   |            | CREATE UNIQUE INDEX bodypart_pkey ON public.bodypart USING btree (id)
 public     | measurement               | measurement_pkey                                                |            | CREATE UNIQUE INDEX measurement_pkey ON public.measurement USING btree (id)
 public     | progress_media            | progress_media_pkey                                             |            | CREATE UNIQUE INDEX progress_media_pkey ON public.progress_media USING btree (id)
 public     | exercises                 | exercises_pkey                                                  |            | CREATE UNIQUE INDEX exercises_pkey ON public.exercises USING btree (id)
 public     | muscle_groups             | muscle_groups_pkey                                              |            | CREATE UNIQUE INDEX muscle_groups_pkey ON public.muscle_groups USING btree (id)
 public     | muscle_groups             | muscle_groups_name_key                                          |            | CREATE UNIQUE INDEX muscle_groups_name_key ON public.muscle_groups USING btree (name)
 public     | exercise_muscle_targets   | exercise_muscle_targets_pkey                                    |            | CREATE UNIQUE INDEX exercise_muscle_targets_pkey ON public.exercise_muscle_targets USING btree (id)
 public     | set_types                 | set_types_pkey                                                  |            | CREATE UNIQUE INDEX set_types_pkey ON public.set_types USING btree (id)
 public     | set_types                 | set_types_name_key                                              |            | CREATE UNIQUE INDEX set_types_name_key ON public.set_types USING btree (name)
 public     | set_type_templates        | set_type_templates_pkey                                         |            | CREATE UNIQUE INDEX set_type_templates_pkey ON public.set_type_templates USING btree (id)
 public     | set_type_templates        | set_type_templates_set_type_id_phase_number_key                 |            | CREATE UNIQUE INDEX set_type_templates_set_type_id_phase_number_key ON public.set_type_templates USING btree (set_type_id, phase_number)
 public     | user_set_executions       | user_set_executions_pkey                                        |            | CREATE UNIQUE INDEX user_set_executions_pkey ON public.user_set_executions USING btree (id)
 public     | user_set_phase_executions | user_set_phase_executions_pkey                                  |            | CREATE UNIQUE INDEX user_set_phase_executions_pkey ON public.user_set_phase_executions USING btree (id)
 public     | user_set_phase_executions | user_set_phase_executions_user_set_execution_id_phase_numbe_key |            | CREATE UNIQUE INDEX user_set_phase_executions_user_set_execution_id_phase_numbe_key ON public.user_set_phase_executions USING btree (user_set_execution_id, phase_number)
 public     | muscle_recovery_rates     | muscle_recovery_rates_pkey                                      |            | CREATE UNIQUE INDEX muscle_recovery_rates_pkey ON public.muscle_recovery_rates USING btree (muscle_group)
 public     | user_workout_plans        | user_workout_plans_pkey                                         |            | CREATE UNIQUE INDEX user_workout_plans_pkey ON public.user_workout_plans USING btree (id)
 public     | user_workout_plan_sets    | user_workout_plan_sets_pkey                                     |            | CREATE UNIQUE INDEX user_workout_plan_sets_pkey ON public.user_workout_plan_sets USING btree (id)
 public     | user_workout_plan_sets    | idx_workout_plan_sets_exercise                                  |            | CREATE INDEX idx_workout_plan_sets_exercise ON public.user_workout_plan_sets USING btree (exercise_id)
 public     | onboarding_steps          | onboarding_steps_pkey                                           |            | CREATE UNIQUE INDEX onboarding_steps_pkey ON public.onboarding_steps USING btree (step)
 public     | user_onboarding_steps     | user_onboarding_steps_pkey                                      |            | CREATE UNIQUE INDEX user_onboarding_steps_pkey ON public.user_onboarding_steps USING btree (id)
 public     | user_onboarding_steps     | user_onboarding_steps_user_id_step_key                          |            | CREATE UNIQUE INDEX user_onboarding_steps_user_id_step_key ON public.user_onboarding_steps USING btree (user_id, step)
(24 rows)


blue=# SELECT sequence_schema, sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public';
 sequence_schema |          sequence_name           
-----------------+----------------------------------
 public          | user_id_seq
 public          | personal_record_id_seq
 public          | bodypart_id_seq
 public          | measurement_id_seq
 public          | progress_media_id_seq
 public          | exercises_id_seq
 public          | muscle_groups_id_seq
 public          | exercise_muscle_targets_id_seq
 public          | set_types_id_seq
 public          | set_type_templates_id_seq
 public          | user_set_executions_id_seq
 public          | user_set_phase_executions_id_seq
 public          | user_workout_plans_id_seq
 public          | user_workout_plan_sets_id_seq
 public          | user_onboarding_steps_id_seq
(15 rows)


blue=# SELECT event_object_table, trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
 event_object_table | trigger_name 
--------------------+--------------
(0 rows)


blue=# SELECT table_name FROM information_schema.views WHERE table_schema = 'public';
 table_name 
------------
(0 rows)


blue=# SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public';
 routine_name | routine_definition 
--------------+--------------------
(0 rows)


blue=# \d+ bodypart
                                                                      Table "public.bodypart"
      Column      |            Type             | Collation | Nullable |               Default                | Storage  | Compression | Stats target | Description 
------------------+-----------------------------+-----------+----------+--------------------------------------+----------+-------------+--------------+-------------
 id               | integer                     |           | not null | nextval('bodypart_id_seq'::regclass) | plain    |             |              | 
 name             | character varying(255)      |           | not null |                                      | extended |             |              | 
 current_strength | double precision            |           |          |                                      | plain    |             |              | 
 last_trained     | timestamp without time zone |           |          |                                      | plain    |             |              | 
 recovery_status  | character varying(20)       |           |          |                                      | extended |             |              | 
Indexes:
    "bodypart_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "bodypart_recovery_status_check" CHECK (recovery_status::text = ANY (ARRAY['fresh'::character varying, 'recovering'::character varying, 'fatigued'::character varying]::text[]))
Access method: heap


blue=# \d+ exercise_muscle_targets
                                                                 Table "public.exercise_muscle_targets"
      Column       |       Type       | Collation | Nullable |                       Default                       | Storage | Compression | Stats target | Description 
-------------------+------------------+-----------+----------+-----------------------------------------------------+---------+-------------+--------------+-------------
 id                | integer          |           | not null | nextval('exercise_muscle_targets_id_seq'::regclass) | plain   |             |              | 
 exercise_id       | integer          |           |          |                                                     | plain   |             |              | 
 muscle_group_id   | integer          |           |          |                                                     | plain   |             |              | 
 effort_percentage | double precision |           | not null |                                                     | plain   |             |              | 
Indexes:
    "exercise_muscle_targets_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "exercise_muscle_targets_effort_percentage_check" CHECK (effort_percentage >= 0::double precision AND effort_percentage <= 100::double precision)
Foreign-key constraints:
    "exercise_muscle_targets_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    "exercise_muscle_targets_muscle_group_id_fkey" FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id) ON DELETE CASCADE
Access method: heap


                                                                   Table "public.exercises"
   Column   |            Type             | Collation | Nullable |                Default                | Storage  | Compression | Stats target | Description 
------------+-----------------------------+-----------+----------+---------------------------------------+----------+-------------+--------------+-------------
 id         | integer                     |           | not null | nextval('exercises_id_seq'::regclass) | plain    |             |              | 
 name       | character varying(255)      |           | not null |                                       | extended |             |              | 
 created_at | timestamp without time zone |           |          | CURRENT_TIMESTAMP                     | plain    |             |              | 
 equipment  | character varying           |           |          |                                       | extended |             |              | 
Indexes:
    "exercises_pkey" PRIMARY KEY, btree (id)
Referenced by:
    TABLE "exercise_muscle_targets" CONSTRAINT "exercise_muscle_targets_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    TABLE "user_workout_plan_sets" CONSTRAINT "fk_exercise" FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    TABLE "user_set_executions" CONSTRAINT "user_set_executions_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES exercises(id)
Access method: heap



blue=# \d+ measurement
                                                                   Table "public.measurement"
   Column    |            Type             | Collation | Nullable |                 Default                 | Storage | Compression | Stats target | Description 
-------------+-----------------------------+-----------+----------+-----------------------------------------+---------+-------------+--------------+-------------
 id          | integer                     |           | not null | nextval('measurement_id_seq'::regclass) | plain   |             |              | 
 user_id     | integer                     |           |          |                                         | plain   |             |              | 
 date        | timestamp without time zone |           | not null |                                         | plain   |             |              | 
 created_at  | timestamp without time zone |           |          | CURRENT_TIMESTAMP                       | plain   |             |              | 
 body_weight | numeric                     |           |          |                                         | main    |             |              | 
 arms        | numeric                     |           |          |                                         | main    |             |              | 
 thighs      | numeric                     |           |          |                                         | main    |             |              | 
 calves      | numeric                     |           |          |                                         | main    |             |              | 
 waist       | numeric                     |           |          |                                         | main    |             |              | 
 forearms    | numeric                     |           |          |                                         | main    |             |              | 
 chest       | numeric                     |           |          |                                         | main    |             |              | 
Indexes:
    "measurement_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "positive_measurements" CHECK ((body_weight IS NULL OR body_weight > 0::numeric) AND (arms IS NULL OR arms > 0::numeric) AND (thighs IS NULL OR thighs > 0::numeric) AND (calves IS NULL OR calves > 0::numeric) AND (waist IS NULL OR waist > 0::numeric) AND (forearms IS NULL OR forearms > 0::numeric) AND (chest IS NULL OR chest > 0::numeric))
Foreign-key constraints:
    "measurement_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
Referenced by:
    TABLE "progress_media" CONSTRAINT "progress_media_measurement_id_fkey" FOREIGN KEY (measurement_id) REFERENCES measurement(id) ON DELETE CASCADE
Access method: heap


blue=# \d+ muscle_groups
                                                                   Table "public.muscle_groups"
   Column   |            Type             | Collation | Nullable |                  Default                  | Storage  | Compression | Stats target | Description 
------------+-----------------------------+-----------+----------+-------------------------------------------+----------+-------------+--------------+-------------
 id         | integer                     |           | not null | nextval('muscle_groups_id_seq'::regclass) | plain    |             |              | 
 name       | character varying(255)      |           | not null |                                           | extended |             |              | 
 created_at | timestamp without time zone |           |          | CURRENT_TIMESTAMP                         | plain    |             |              | 
Indexes:
    "muscle_groups_pkey" PRIMARY KEY, btree (id)
    "muscle_groups_name_key" UNIQUE CONSTRAINT, btree (name)
Referenced by:
    TABLE "exercise_muscle_targets" CONSTRAINT "exercise_muscle_targets_muscle_group_id_fkey" FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id) ON DELETE CASCADE
Access method: heap


blue=# \d+ muscle_recovery_rates
                                          Table "public.muscle_recovery_rates"
    Column     |       Type       | Collation | Nullable | Default | Storage  | Compression | Stats target | Description 
---------------+------------------+-----------+----------+---------+----------+-------------+--------------+-------------
 muscle_group  | text             |           | not null |         | extended |             |              | 
 recovery_rate | double precision |           |          |         | plain    |             |              | 
Indexes:
    "muscle_recovery_rates_pkey" PRIMARY KEY, btree (muscle_group)
Access method: heap



blue=# \d+ onboarding_steps
                                            Table "public.onboarding_steps"
 Column |         Type          | Collation | Nullable | Default | Storage  | Compression | Stats target | Description 
--------+-----------------------+-----------+----------+---------+----------+-------------+--------------+-------------
 step   | character varying(50) |           | not null |         | extended |             |              | 
Indexes:
    "onboarding_steps_pkey" PRIMARY KEY, btree (step)
Referenced by:
    TABLE "user_onboarding_steps" CONSTRAINT "user_onboarding_steps_step_fkey" FOREIGN KEY (step) REFERENCES onboarding_steps(step) ON DELETE CASCADE
Access method: heap



blue=# \d+ personal_record
                                                                   Table "public.personal_record"
   Column    |            Type             | Collation | Nullable |                   Default                   | Storage | Compression | Stats target | Description 
-------------+-----------------------------+-----------+----------+---------------------------------------------+---------+-------------+--------------+-------------
 id          | integer                     |           | not null | nextval('personal_record_id_seq'::regclass) | plain   |             |              | 
 user_id     | integer                     |           |          |                                             | plain   |             |              | 
 exercise_id | integer                     |           |          |                                             | plain   |             |              | 
 weight      | double precision            |           |          |                                             | plain   |             |              | 
 reps        | integer                     |           |          |                                             | plain   |             |              | 
 achieved_at | timestamp without time zone |           | not null |                                             | plain   |             |              | 
Indexes:
    "personal_record_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "personal_record_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
Access method: heap



blue=# \d+ progress_media
                                                                     Table "public.progress_media"
     Column     |            Type             | Collation | Nullable |                  Default                   | Storage  | Compression | Stats target | Description 
----------------+-----------------------------+-----------+----------+--------------------------------------------+----------+-------------+--------------+-------------
 id             | integer                     |           | not null | nextval('progress_media_id_seq'::regclass) | plain    |             |              | 
 measurement_id | integer                     |           |          |                                            | plain    |             |              | 
 media_type     | character varying(10)       |           | not null |                                            | extended |             |              | 
 media_url      | text                        |           | not null |                                            | extended |             |              | 
 created_at     | timestamp without time zone |           |          | CURRENT_TIMESTAMP                          | plain    |             |              | 
Indexes:
    "progress_media_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "progress_media_media_type_check" CHECK (media_type::text = ANY (ARRAY['photo'::character varying, 'video'::character varying]::text[]))
Foreign-key constraints:
    "progress_media_measurement_id_fkey" FOREIGN KEY (measurement_id) REFERENCES measurement(id) ON DELETE CASCADE
Access method: heap




blue=# \d+ set_type_templates
                                                                           Table "public.set_type_templates"
           Column           |            Type             | Collation | Nullable |                    Default                     | Storage | Compression | Stats target | Description 
----------------------------+-----------------------------+-----------+----------+------------------------------------------------+---------+-------------+--------------+-------------
 id                         | integer                     |           | not null | nextval('set_type_templates_id_seq'::regclass) | plain   |             |              | 
 set_type_id                | integer                     |           |          |                                                | plain   |             |              | 
 phase_number               | integer                     |           | not null |                                                | plain   |             |              | 
 rep_range_min              | integer                     |           |          |                                                | plain   |             |              | 
 rep_range_max              | integer                     |           |          |                                                | plain   |             |              | 
 weight_modifier            | double precision            |           | not null |                                                | plain   |             |              | 
 target_rest_period_seconds | integer                     |           |          |                                                | plain   |             |              | 
 created_at                 | timestamp without time zone |           |          | CURRENT_TIMESTAMP                              | plain   |             |              | 
Indexes:
    "set_type_templates_pkey" PRIMARY KEY, btree (id)
    "set_type_templates_set_type_id_phase_number_key" UNIQUE CONSTRAINT, btree (set_type_id, phase_number)
Foreign-key constraints:
    "set_type_templates_set_type_id_fkey" FOREIGN KEY (set_type_id) REFERENCES set_types(id) ON DELETE CASCADE
Referenced by:
    TABLE "user_workout_plan_sets" CONSTRAINT "user_workout_plan_sets_set_type_template_id_fkey" FOREIGN KEY (set_type_template_id) REFERENCES set_type_templates(id)
Access method: heap



blue=# \d+ set_types
                                                                   Table "public.set_types"
   Column   |            Type             | Collation | Nullable |                Default                | Storage  | Compression | Stats target | Description 
------------+-----------------------------+-----------+----------+---------------------------------------+----------+-------------+--------------+-------------
 id         | integer                     |           | not null | nextval('set_types_id_seq'::regclass) | plain    |             |              | 
 name       | character varying(255)      |           | not null |                                       | extended |             |              | 
 created_at | timestamp without time zone |           |          | CURRENT_TIMESTAMP                     | plain    |             |              | 
Indexes:
    "set_types_pkey" PRIMARY KEY, btree (id)
    "set_types_name_key" UNIQUE CONSTRAINT, btree (name)
Referenced by:
    TABLE "set_type_templates" CONSTRAINT "set_type_templates_set_type_id_fkey" FOREIGN KEY (set_type_id) REFERENCES set_types(id) ON DELETE CASCADE
    TABLE "user_set_executions" CONSTRAINT "user_set_executions_set_type_id_fkey" FOREIGN KEY (set_type_id) REFERENCES set_types(id)
Access method: heap



blue=# \d+ user_onboarding_steps
                                                                    Table "public.user_onboarding_steps"
    Column    |            Type             | Collation | Nullable |                      Default                      | Storage  | Compression | Stats target | Description 
--------------+-----------------------------+-----------+----------+---------------------------------------------------+----------+-------------+--------------+-------------
 id           | integer                     |           | not null | nextval('user_onboarding_steps_id_seq'::regclass) | plain    |             |              | 
 user_id      | integer                     |           |          |                                                   | plain    |             |              | 
 step         | character varying(50)       |           |          |                                                   | extended |             |              | 
 completed_at | timestamp without time zone |           |          | CURRENT_TIMESTAMP                                 | plain    |             |              | 
Indexes:
    "user_onboarding_steps_pkey" PRIMARY KEY, btree (id)
    "user_onboarding_steps_user_id_step_key" UNIQUE CONSTRAINT, btree (user_id, step)
Foreign-key constraints:
    "user_onboarding_steps_step_fkey" FOREIGN KEY (step) REFERENCES onboarding_steps(step) ON DELETE CASCADE
    "user_onboarding_steps_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
Access method: heap



blue=# \d+ user_set_executions
                                                                   Table "public.user_set_executions"
   Column    |            Type             | Collation | Nullable |                     Default                     | Storage | Compression | Stats target | Description 
-------------+-----------------------------+-----------+----------+-------------------------------------------------+---------+-------------+--------------+-------------
 id          | integer                     |           | not null | nextval('user_set_executions_id_seq'::regclass) | plain   |             |              | 
 user_id     | integer                     |           |          |                                                 | plain   |             |              | 
 set_type_id | integer                     |           |          |                                                 | plain   |             |              | 
 exercise_id | integer                     |           |          |                                                 | plain   |             |              | 
 base_weight | double precision            |           |          |                                                 | plain   |             |              | 
 created_at  | timestamp without time zone |           |          | CURRENT_TIMESTAMP                               | plain   |             |              | 
Indexes:
    "user_set_executions_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "user_set_executions_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    "user_set_executions_set_type_id_fkey" FOREIGN KEY (set_type_id) REFERENCES set_types(id)
    "user_set_executions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
Referenced by:
    TABLE "user_set_phase_executions" CONSTRAINT "user_set_phase_executions_user_set_execution_id_fkey" FOREIGN KEY (user_set_execution_id) REFERENCES user_set_executions(id)
Access method: heap




blue=# \d+ user_set_phase_executions
                                                                           Table "public.user_set_phase_executions"
           Column           |            Type             | Collation | Nullable |                        Default                        | Storage | Compression | Stats target | Description 
----------------------------+-----------------------------+-----------+----------+-------------------------------------------------------+---------+-------------+--------------+-------------
 id                         | integer                     |           | not null | nextval('user_set_phase_executions_id_seq'::regclass) | plain   |             |              | 
 user_set_execution_id      | integer                     |           |          |                                                       | plain   |             |              | 
 phase_number               | integer                     |           | not null |                                                       | plain   |             |              | 
 actual_reps                | integer                     |           |          |                                                       | plain   |             |              | 
 actual_weight              | double precision            |           |          |                                                       | plain   |             |              | 
 actual_rest_period_seconds | integer                     |           |          |                                                       | plain   |             |              | 
 completed_at               | timestamp without time zone |           |          |                                                       | plain   |             |              | 
Indexes:
    "user_set_phase_executions_pkey" PRIMARY KEY, btree (id)
    "user_set_phase_executions_user_set_execution_id_phase_numbe_key" UNIQUE CONSTRAINT, btree (user_set_execution_id, phase_number)
Foreign-key constraints:
    "user_set_phase_executions_user_set_execution_id_fkey" FOREIGN KEY (user_set_execution_id) REFERENCES user_set_executions(id)
Access method: heap




blue=# \d+ user_workout_plan_sets
                                                                                Table "public.user_workout_plan_sets"
        Column        |  Type   | Collation | Nullable |                      Default                       | Storage | Compression | Stats target |                   Description                   
----------------------+---------+-----------+----------+----------------------------------------------------+---------+-------------+--------------+-------------------------------------------------
 id                   | integer |           | not null | nextval('user_workout_plan_sets_id_seq'::regclass) | plain   |             |              | 
 user_workout_plan_id | integer |           | not null |                                                    | plain   |             |              | 
 set_type_template_id | integer |           | not null |                                                    | plain   |             |              | 
 planned_base_weight  | numeric |           |          |                                                    | main    |             |              | 
 exercise_id          | integer |           |          |                                                    | plain   |             |              | ID of the exercise to be performed for this set
Indexes:
    "user_workout_plan_sets_pkey" PRIMARY KEY, btree (id)
    "idx_workout_plan_sets_exercise" btree (exercise_id)
Foreign-key constraints:
    "fk_exercise" FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    "user_workout_plan_sets_set_type_template_id_fkey" FOREIGN KEY (set_type_template_id) REFERENCES set_type_templates(id)
    "user_workout_plan_sets_user_workout_plan_id_fkey" FOREIGN KEY (user_workout_plan_id) REFERENCES user_workout_plans(id)
Access method: heap




blue=# \d+ user_workout_plans
                                                                     Table "public.user_workout_plans"
     Column     |            Type             | Collation | Nullable |                    Default                     | Storage | Compression | Stats target | Description 
----------------+-----------------------------+-----------+----------+------------------------------------------------+---------+-------------+--------------+-------------
 id             | integer                     |           | not null | nextval('user_workout_plans_id_seq'::regclass) | plain   |             |              | 
 user_id        | integer                     |           | not null |                                                | plain   |             |              | 
 scheduled_date | date                        |           | not null |                                                | plain   |             |              | 
 created_at     | timestamp without time zone |           |          | now()                                          | plain   |             |              | 
Indexes:
    "user_workout_plans_pkey" PRIMARY KEY, btree (id)
Referenced by:
    TABLE "user_workout_plan_sets" CONSTRAINT "user_workout_plan_sets_user_workout_plan_id_fkey" FOREIGN KEY (user_workout_plan_id) REFERENCES user_workout_plans(id)
Access method: heap


blue=# \d+ users
                                                                        Table "public.users"
        Column        |            Type             | Collation | Nullable |             Default              | Storage  | Compression | Stats target | Description 
----------------------+-----------------------------+-----------+----------+----------------------------------+----------+-------------+--------------+-------------
 id                   | integer                     |           | not null | nextval('user_id_seq'::regclass) | plain    |             |              | 
 email                | character varying(255)      |           | not null |                                  | extended |             |              | 
 password_hash        | character varying(255)      |           | not null |                                  | extended |             |              | 
 google_auth          | boolean                     |           |          | false                            | plain    |             |              | 
 created_at           | timestamp without time zone |           |          | CURRENT_TIMESTAMP                | plain    |             |              | 
 premium_status       | boolean                     |           |          | false                            | plain    |             |              | 
 trial_started        | timestamp without time zone |           |          |                                  | plain    |             |              | 
 metric_system        | boolean                     |           |          | true                             | plain    |             |              | 
 newsletter           | boolean                     |           |          | false                            | plain    |             |              | 
 active               | boolean                     |           |          | true                             | plain    |             |              | 
 trial_period_ends_at | timestamp without time zone |           |          |                                  | plain    |             |              | 
 is_first_time_user   | boolean                     |           |          | true                             | plain    |             |              | 
Indexes:
    "user_pkey" PRIMARY KEY, btree (id)
    "user_email_key" UNIQUE CONSTRAINT, btree (email)
Referenced by:
    TABLE "measurement" CONSTRAINT "measurement_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "personal_record" CONSTRAINT "personal_record_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
    TABLE "user_onboarding_steps" CONSTRAINT "user_onboarding_steps_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    TABLE "user_set_executions" CONSTRAINT "user_set_executions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
Access method: heap


blue=# SELECT * FROM bodypart;
 id |    name    | current_strength | last_trained | recovery_status 
----+------------+------------------+--------------+-----------------
  1 | Biceps     |                  |              | 
  2 | Triceps    |                  |              | 
  3 | Chest      |                  |              | 
  4 | Back       |                  |              | 
  5 | Quads      |                  |              | 
  6 | Hamstrings |                  |              | 
(6 rows)


blue=# SELECT * FROM exercise_muscle_targets;
 id  | exercise_id | muscle_group_id | effort_percentage 
-----+-------------+-----------------+-------------------
   1 |           1 |               1 |                55
   2 |           1 |               2 |                20
   3 |           1 |               3 |                15
   4 |           1 |               4 |                10
   9 |           2 |               1 |                10
  10 |           2 |               3 |                15
  11 |           2 |               2 |                20
  12 |           2 |               4 |                55
  13 |           3 |               3 |                20
  14 |           3 |               2 |                20
  15 |           3 |               5 |                60
  16 |           4 |              21 |                10
  17 |           4 |               3 |                15
  18 |           4 |               2 |                20
  19 |           4 |               1 |                55
  20 |           5 |               2 |                20
  21 |           5 |               3 |                30
  22 |           5 |               1 |                50
  23 |           6 |               8 |                 5
  24 |           6 |               7 |                10
  25 |           6 |               3 |                20
  26 |           6 |               6 |                25
  27 |           6 |               2 |                40
  28 |           7 |               7 |                10
  29 |           7 |               3 |                25
  30 |           7 |               6 |                30
  31 |           7 |               2 |                35
  32 |           8 |               7 |                10
  33 |           8 |               3 |                15
  34 |           8 |              12 |                10
  35 |           8 |               6 |                35
  36 |           8 |               2 |                30
  37 |           9 |              12 |                10
  38 |           9 |              11 |                20
  39 |           9 |              10 |                25
  40 |           9 |               9 |                45
  41 |          10 |              12 |                10
  42 |          10 |              10 |                20
  43 |          10 |              11 |                30
  44 |          10 |               9 |                40
  45 |          11 |              11 |                10
  46 |          11 |              12 |                10
  47 |          11 |               7 |                20
  48 |          11 |              13 |                25
  49 |          11 |               9 |                35
  50 |          12 |              11 |                10
  51 |          12 |              12 |                10
  52 |          12 |               7 |                20
  53 |          12 |              13 |                25
  54 |          12 |               9 |                35
  55 |          13 |              11 |                 5
  56 |          13 |              12 |                10
  57 |          13 |               7 |                15
  58 |          13 |              13 |                30
  59 |          13 |               9 |                40
  60 |          14 |              12 |                10
  61 |          14 |              11 |                20
  62 |          14 |              13 |                30
  63 |          14 |               9 |                40
  64 |          15 |              12 |                10
  65 |          15 |              11 |                20
  66 |          15 |              10 |                25
  67 |          15 |               9 |                45
  68 |          16 |               7 |                15
  69 |          16 |              13 |                25
  70 |          16 |              14 |                25
  71 |          16 |              12 |                35
  72 |          17 |              19 |                 5
  73 |          17 |              18 |                10
  74 |          17 |              17 |                15
  75 |          17 |              16 |                25
  76 |          17 |              15 |                45
  77 |          18 |              10 |                 5
  78 |          18 |              20 |                10
  79 |          18 |              19 |                15
  80 |          18 |              16 |                20
  81 |          18 |              15 |                50
  82 |          19 |              21 |                 5
  83 |          19 |              18 |                15
  84 |          19 |              16 |                30
  85 |          19 |              15 |                50
  86 |          20 |              19 |                10
  87 |          20 |              18 |                10
  88 |          20 |              16 |                20
  89 |          20 |              15 |                60
  90 |          21 |              23 |                 5
  91 |          21 |               7 |                 5
  92 |          21 |              15 |                10
  93 |          21 |              18 |                20
  94 |          21 |              16 |                25
  95 |          21 |              19 |                35
  96 |          22 |               7 |                10
  97 |          22 |              19 |                20
  98 |          22 |              16 |                30
  99 |          22 |              18 |                40
 100 |          23 |              22 |                10
 101 |          23 |              19 |                15
 102 |          23 |              15 |                20
 103 |          23 |              18 |                25
 104 |          23 |              16 |                30
 105 |          24 |              17 |                 5
 106 |          24 |              19 |                10
 107 |          24 |              18 |                25
 108 |          24 |              16 |                60
 109 |          25 |              17 |                 5
 110 |          25 |              18 |                15
 111 |          25 |              16 |                30
 112 |          25 |              15 |                50
 113 |          26 |              21 |                15
 114 |          26 |               2 |                15
 115 |          26 |               1 |                70
 116 |          27 |              21 |                15
 117 |          27 |               2 |                15
 118 |          27 |               1 |                70
 119 |          28 |               2 |                15
 120 |          28 |               1 |                75
 121 |          29 |               7 |                10
 122 |          29 |               2 |                15
 123 |          29 |               6 |                75
 124 |          30 |               7 |                10
 125 |          30 |              10 |                20
 126 |          30 |              12 |                70
 127 |          31 |               3 |               100
 128 |          32 |               3 |               100
 129 |          33 |               3 |               100
 130 |          34 |              25 |                10
 131 |          34 |              24 |                20
 132 |          34 |              11 |                70
 133 |          35 |              25 |                20
 134 |          35 |              24 |                30
 135 |          35 |              11 |                50
 136 |          36 |              25 |                 5
 137 |          36 |              24 |                15
 138 |          36 |              11 |                80
 139 |          37 |              25 |                 5
 140 |          37 |              24 |                20
 141 |          37 |              11 |                75
 142 |          38 |              21 |                15
 143 |          38 |              15 |                85
 144 |          39 |              16 |                15
 145 |          39 |              18 |                85
 146 |          40 |              21 |                10
 147 |          40 |              29 |                90
 148 |          41 |              21 |                10
 149 |          41 |              29 |                90
 150 |          42 |              20 |               100
 151 |          43 |              27 |                30
 152 |          43 |              26 |                70
 153 |          44 |              28 |                20
 154 |          44 |              26 |                80
 155 |          45 |              26 |                30
 156 |          45 |              28 |                70
 157 |          46 |              19 |                20
 158 |          46 |              18 |                40
 159 |          46 |              16 |                40
 160 |          47 |              10 |                10
 161 |          47 |               7 |                90
 162 |          48 |               2 |                20
 163 |          48 |               7 |                30
 164 |          48 |               6 |                50
 165 |          49 |               7 |                10
 166 |          49 |               3 |                25
 167 |          49 |               6 |                30
 168 |          49 |               2 |                35
 169 |          50 |               3 |                15
 170 |          50 |               2 |                25
 171 |          50 |               1 |                60
(167 rows)




blue=# SELECT * FROM exercises;
 id  |              name              |         created_at         |      equipment       
-----+--------------------------------+----------------------------+----------------------
   1 | Barbell Bench Press            | 2025-02-18 05:18:45.269068 | Barbell
   2 | Incline Barbell Bench Press    | 2025-02-18 05:18:45.269068 | Barbell
   3 | Decline Barbell Bench Press    | 2025-02-18 05:18:45.269068 | Barbell
   6 | Overhead Press                 | 2025-02-18 05:18:45.269068 | Barbell
  11 | Barbell Row                    | 2025-02-18 05:18:45.269068 | Barbell
  17 | Back Squat                     | 2025-02-18 05:18:45.269068 | Barbell
  21 | Conventional Deadlift          | 2025-02-18 05:18:45.269068 | Barbell
  22 | Romanian Deadlift              | 2025-02-18 05:18:45.269068 | Barbell
  23 | Sumo Deadlift                  | 2025-02-18 05:18:45.269068 | Barbell
   4 | Dumbbell Bench Press           | 2025-02-18 05:18:45.269068 | Dumbbells
   7 | Dumbbell Shoulder Press        | 2025-02-18 05:18:45.269068 | Dumbbells
   8 | Arnold Press                   | 2025-02-18 05:18:45.269068 | Dumbbells
  12 | Dumbbell Row                   | 2025-02-18 05:18:45.269068 | Dumbbells
  26 | Dumbbell Flyes                 | 2025-02-18 05:18:45.269068 | Dumbbells
  32 | Dumbbell Triceps Extension     | 2025-02-18 05:18:45.269068 | Dumbbells
  34 | Dumbbell Curl                  | 2025-02-18 05:18:45.269068 | Dumbbells
  35 | Hammer Curl                    | 2025-02-18 05:18:45.269068 | Dumbbells
  47 | Dumbbell Shrug                 | 2025-02-18 05:18:45.269068 | Dumbbells
  49 | Seated Dumbbell Shoulder Press | 2025-02-18 05:18:45.269068 | Dumbbells
  14 | Seated Cable Row               | 2025-02-18 05:18:45.269068 | Cable Machine
  15 | Lat Pulldown                   | 2025-02-18 05:18:45.269068 | Cable Machine
  16 | Face Pull                      | 2025-02-18 05:18:45.269068 | Cable Machine
  27 | Cable Flyes                    | 2025-02-18 05:18:45.269068 | Cable Machine
  29 | Cable Lateral Raise            | 2025-02-18 05:18:45.269068 | Cable Machine
  33 | Cable Triceps Pushdown         | 2025-02-18 05:18:45.269068 | Cable Machine
  44 | Cable Crunch                   | 2025-02-18 05:18:45.269068 | Cable Machine
  13 | T-Bar Row                      | 2025-02-18 05:18:45.269068 | Machine
  20 | Hack Squat                     | 2025-02-18 05:18:45.269068 | Machine
  25 | Leg Press                      | 2025-02-18 05:18:45.269068 | Machine
  28 | Pec Deck Machine               | 2025-02-18 05:18:45.269068 | Machine
  38 | Leg Extensions                 | 2025-02-18 05:18:45.269068 | Machine
  39 | Leg Curls                      | 2025-02-18 05:18:45.269068 | Machine
  50 | Machine Chest Press            | 2025-02-18 05:18:45.269068 | Machine
   5 | Chest Dips                     | 2025-02-18 05:18:45.269068 | Bodyweight
   9 | Pull-up                        | 2025-02-18 05:18:45.269068 | Bodyweight
  10 | Chin-up                        | 2025-02-18 05:18:45.269068 | Bodyweight
  42 | Plank                          | 2025-02-18 05:18:45.269068 | Bodyweight
  43 | Hanging Leg Raise              | 2025-02-18 05:18:45.269068 | Bodyweight
  45 | Russian Twist                  | 2025-02-18 05:18:45.269068 | Bodyweight
  24 | Hip Thrust                     | 2025-02-18 05:18:45.269068 | Hip Thrust Machine
  46 | Glute Ham Raise                | 2025-02-18 05:18:45.269068 | Glute Ham Developer
  19 | Bulgarian Split Squat          | 2025-02-18 05:18:45.269068 | Dumbbells or Barbell
  30 | Rear Delt Fly                  | 2025-02-18 05:18:45.269068 | Dumbbells or Cable
  36 | Preacher Curl                  | 2025-02-18 05:18:45.269068 | Dumbbells or Cable
  37 | Concentration Curl             | 2025-02-18 05:18:45.269068 | Dumbbells or Cable
  48 | Upright Row                    | 2025-02-18 05:18:45.269068 | Dumbbells or Cable
  40 | Standing Calf Raise            | 2025-02-18 05:18:45.269068 | Machine
  41 | Seated Calf Raise              | 2025-02-18 05:18:45.269068 | Machine
  18 | Front Squat                    | 2025-02-18 05:18:45.269068 | Other
  31 | Skull Crusher                  | 2025-02-18 05:18:45.269068 | Other
 100 | Test Bench Press               | 2025-02-28 05:22:22.262975 | Barbell
(51 rows)






blue=# SELECT * FROM measurement;
 id | user_id |        date         |         created_at         | body_weight |  arms  | thighs | calves | waist  | forearms | chest 
----+---------+---------------------+----------------------------+-------------+--------+--------+--------+--------+----------+-------
  1 |         | 2024-02-16 12:00:00 | 2025-02-17 00:53:29.352209 |        75.5 |   35.2 |        |        |        |          |      
  2 |       2 | 2024-02-16 12:00:00 | 2025-02-17 00:58:59.382726 |        75.5 |   35.2 |        |        |        |          |      
  3 |         | 2025-02-19 00:00:00 | 2025-02-19 06:16:19.058654 |          80 |     40 |     50 |     30 |     85 |       35 |   100
  4 |         | 2025-02-19 00:00:00 | 2025-02-19 06:29:23.305876 |          80 |     40 |     50 |     30 |     85 |       35 |   100
  5 |         | 2025-02-19 00:00:00 | 2025-02-19 06:30:56.547783 |          83 |     40 |     50 |     30 |     85 |       35 |   100
  6 |         | 2025-02-19 00:00:00 | 2025-02-19 06:31:00.086242 |          84 |     40 |     50 |     30 |     85 |       35 |   100
  7 |         | 2025-02-19 00:00:00 | 2025-02-19 06:31:03.386667 |          85 |     40 |     50 |     30 |     85 |       35 |   100
  8 |         | 2025-02-19 00:00:00 | 2025-02-19 06:31:06.480396 |          87 |     40 |     50 |     30 |     85 |       35 |   100
  9 |         | 2025-02-19 00:00:00 | 2025-02-19 06:31:14.414764 |          90 |     40 |     50 |     30 |     85 |       35 |   100
 10 |         | 2025-02-19 00:00:00 | 2025-02-19 06:41:17.600187 |          95 |     40 |     50 |     30 |     85 |       35 |   100
 11 |         | 2025-02-19 00:00:00 | 2025-02-19 07:55:39.70249  |          99 |     40 |     50 |     30 |     85 |       35 |   100
 12 |         | 2025-02-19 00:00:00 | 2025-02-19 08:14:46.285976 |          99 |     40 |     50 |     30 |     85 |       35 |   100
 13 |         | 2025-02-19 00:00:00 | 2025-02-19 08:26:03.754863 |          99 |     40 |     50 |     30 |     85 |       35 |   100
 14 |         | 2025-02-19 00:00:00 | 2025-02-19 08:27:20.313306 |          99 |     40 |     50 |     30 |     85 |       35 |   100
 15 |         | 2025-02-19 00:00:00 | 2025-02-19 08:28:25.331895 |          99 |     40 |     50 |     30 |     85 |       35 |   100
 16 |       3 | 2025-02-19 00:00:00 | 2025-02-19 08:35:15.300254 |         102 |     40 |     50 |     30 |     85 |       35 |   100
 17 |       3 | 2025-02-19 00:00:00 | 2025-02-19 08:35:45.488102 |          12 |     40 |     50 |     30 |     85 |       35 |   100
 18 |       3 | 2025-02-19 00:00:00 | 2025-02-19 08:35:49.584094 |         112 |     40 |     50 |     30 |     85 |       35 |   100
 19 |       3 | 2025-02-19 00:00:00 | 2025-02-19 08:35:53.741874 |         122 |     40 |     50 |     30 |     85 |       35 |   100
 20 |       3 | 2025-02-19 00:00:00 | 2025-02-19 08:36:01.55139  |         128 |     40 |     50 |     30 |     85 |       35 |   100
 21 |       3 | 2025-02-19 00:00:00 | 2025-02-19 08:36:17.438137 |         130 |     40 |     50 |     30 |     85 |       35 |   100
 22 |       3 | 2025-02-19 00:00:00 | 2025-02-19 08:36:27.211757 |         100 |     40 |     50 |     30 |     85 |       35 |   100
 23 |      21 | 2025-02-22 00:00:00 | 2025-02-22 10:31:58.758768 |          93 |        |        |        |        |          |      
 24 |      20 | 2025-02-22 00:00:00 | 2025-02-22 17:31:31.15065  |          64 |        |        |        |        |          |      
 25 |      20 | 2025-02-22 06:00:00 | 2025-02-22 17:35:37.021185 |          75 |     20 |     20 |     20 |     20 |       20 |    20
 26 |      20 | 2025-02-22 12:00:00 | 2025-02-22 17:35:57.424072 |          75 |     73 |     60 |     20 |     72 |      115 |    20
 27 |      20 | 2025-02-22 18:00:00 | 2025-02-22 17:40:59.345853 |          81 |     73 |     60 |     20 |     72 |      115 |    20
 28 |      20 | 2025-02-22 00:00:00 | 2025-02-22 17:41:20.325469 |         137 |     20 |     20 |     20 |     20 |       20 |    20
 29 |      20 | 2025-02-23 00:00:00 | 2025-02-22 17:57:15.020247 |       41.11 | 185.42 |  152.4 |   50.8 | 182.88 |    292.1 |  50.8
 30 |      20 | 2025-02-23 06:00:00 | 2025-02-22 17:59:41.54508  |       41.11 |     82 |  152.4 |   50.8 |     83 |    292.1 |  50.8
 31 |      20 | 2025-02-23 06:00:00 | 2025-02-22 17:59:50.71571  |          81 |     82 |  152.4 |   50.8 |     83 |    292.1 |  50.8
 32 |      20 | 2025-02-23 06:00:00 | 2025-02-22 17:59:53.636256 |          81 |     82 |  152.4 |   50.8 |     83 |    292.1 |  50.8
 33 |      20 | 2025-02-23 12:00:00 | 2025-02-22 18:15:30.463606 |       121.3 |  139.7 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 34 |      20 | 2025-02-23 18:00:00 | 2025-02-22 18:21:07.885154 |       121.3 |  139.7 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 35 |      20 | 2025-02-24 00:00:00 | 2025-02-22 18:30:04.901828 |       107.3 |  139.7 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 36 |      20 | 2025-02-24 06:00:00 | 2025-02-22 18:30:51.023478 |        42.6 |  139.7 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 37 |      20 | 2025-02-22 00:00:00 | 2025-02-22 18:32:05.793729 |          40 |     20 |     20 |     20 |     20 |       20 |    20
 38 |      20 | 2025-02-24 12:00:00 | 2025-02-22 18:33:09.590327 |        49.9 |  139.7 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 39 |      20 | 2025-02-24 18:00:00 | 2025-02-22 18:33:25.05983  |        55.6 |  139.7 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 40 |      20 | 2025-02-25 00:00:00 | 2025-02-22 18:34:21.443765 |        55.6 |  139.7 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 41 |      20 | 2025-02-25 06:00:00 | 2025-02-22 18:35:18.075449 |        55.6 |  139.7 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 42 |      20 | 2025-02-25 12:00:00 | 2025-02-22 18:45:38.514258 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 43 |      20 | 2025-02-25 18:00:00 | 2025-02-22 18:46:50.215927 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 44 |      20 | 2025-02-26 00:00:00 | 2025-02-22 19:01:39.270585 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 45 |      20 | 2025-02-26 06:00:00 | 2025-02-22 19:04:01.975696 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 46 |      20 | 2025-02-26 12:00:00 | 2025-02-22 19:04:37.07771  |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 47 |      20 | 2025-02-26 18:00:00 | 2025-02-22 19:10:36.63766  |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 48 |      20 | 2025-02-27 00:00:00 | 2025-02-22 19:14:49.334066 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 49 |      20 | 2025-02-27 06:00:00 | 2025-02-22 19:16:48.684395 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 50 |      20 | 2025-02-27 12:00:00 | 2025-02-22 19:19:18.957023 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 51 |      20 | 2025-02-27 18:00:00 | 2025-02-22 19:24:34.224074 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 52 |      20 | 2025-02-27 18:00:00 | 2025-02-22 19:34:10.351865 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 53 |      20 | 2025-02-28 00:00:00 | 2025-02-22 19:49:34.528735 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 54 |      20 | 2025-02-28 06:00:00 | 2025-02-22 20:12:23.050774 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 55 |      20 | 2025-02-28 06:00:00 | 2025-02-22 20:12:23.106262 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 56 |      20 | 2025-02-28 12:00:00 | 2025-02-22 20:12:33.536924 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 57 |      20 | 2025-02-28 18:00:00 | 2025-02-22 20:13:37.045261 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 58 |      20 | 2025-03-01 00:00:00 | 2025-02-22 20:13:44.886437 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 59 |      20 | 2025-03-01 06:00:00 | 2025-02-22 20:14:44.661724 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 60 |      20 | 2025-03-01 06:00:00 | 2025-02-22 20:19:45.294635 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 61 |      20 | 2025-03-01 12:00:00 | 2025-02-22 20:20:10.72905  |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 62 |      20 | 2025-03-01 12:00:00 | 2025-02-22 20:20:39.978643 |        55.6 |  109.1 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 63 |      20 | 2025-03-01 18:00:00 | 2025-02-22 21:32:47.446502 |        55.6 |   82.2 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 64 |      20 | 2025-03-02 00:00:00 | 2025-02-26 09:33:10.672559 |        80.8 |   82.2 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 65 |      20 | 2025-03-02 06:00:00 | 2025-02-26 19:10:42.792282 |       100.8 |   82.2 |   33.6 |   31.6 |  142.3 |     82.6 |  30.4
 66 |      20 | 2025-03-02 12:00:00 | 2025-02-26 19:12:59.512441 |       149.8 |  143.6 |  147.8 |  145.1 |  142.3 |    149.9 | 143.3
 67 |      20 | 2025-03-02 18:00:00 | 2025-02-26 21:23:58.260632 |        41.5 |  143.6 |  147.8 |  145.1 |  142.3 |    149.9 | 143.3
 68 |      33 | 2025-03-13 00:00:00 | 2025-03-13 08:18:22.517466 |         123 |        |        |        |        |          |      
 69 |      20 | 2025-03-03 00:00:00 | 2025-03-14 05:28:06.978035 |       145.6 |  143.6 |  147.8 |  145.1 |  142.3 |    149.9 | 143.3
 70 |      20 | 2025-03-03 06:00:00 | 2025-03-14 05:41:49.93972  |       145.6 |  143.6 |  147.8 |  145.1 |  142.3 |    149.9 | 143.3
(70 rows)



blue=# SELECT * FROM muscle_groups;
 id |     name     |         created_at         
----+--------------+----------------------------
  1 | Chest        | 2025-02-18 05:18:24.060312
  2 | Front Delts  | 2025-02-18 05:18:24.060312
  3 | Triceps      | 2025-02-18 05:18:24.060312
  4 | Upper Chest  | 2025-02-18 05:18:24.060312
  5 | Lower Chest  | 2025-02-18 05:18:24.060312
  6 | Side Delts   | 2025-02-18 05:18:24.060312
  7 | Traps        | 2025-02-18 05:18:24.060312
  8 | Serratus     | 2025-02-18 05:18:24.060312
  9 | Back         | 2025-02-18 05:18:24.060312
 10 | Upper Back   | 2025-02-18 05:18:24.060312
 11 | Biceps       | 2025-02-18 05:18:24.060312
 12 | Rear Delts   | 2025-02-18 05:18:24.060312
 13 | Middle Back  | 2025-02-18 05:18:24.060312
 14 | Rotator Cuff | 2025-02-18 05:18:24.060312
 15 | Quads        | 2025-02-18 05:18:24.060312
 16 | Glutes       | 2025-02-18 05:18:24.060312
 17 | Inner Thighs | 2025-02-18 05:18:24.060312
 18 | Hamstrings   | 2025-02-18 05:18:24.060312
 19 | Lower Back   | 2025-02-18 05:18:24.060312
 20 | Core         | 2025-02-18 05:18:24.060312
 21 | Stabilizers  | 2025-02-18 05:18:24.060312
 22 | Adductors    | 2025-02-18 05:18:24.060312
 23 | Lats         | 2025-02-18 05:18:24.060312
 24 | Brachialis   | 2025-02-18 05:18:24.060312
 25 | Forearms     | 2025-02-18 05:18:24.060312
 26 | Abs          | 2025-02-18 05:18:24.060312
 27 | Hip Flexors  | 2025-02-18 05:18:24.060312
 28 | Obliques     | 2025-02-18 05:18:24.060312
 29 | Calves       | 2025-02-18 05:18:24.060312
(29 rows)


blue=# SELECT * FROM muscle_recovery_rates;
 muscle_group | recovery_rate 
--------------+---------------
 biceps       |          0.06
 triceps      |          0.06
 chest        |          0.05
 back         |          0.04
 quads        |          0.03
 hamstrings   |          0.03
 Front Delts  |          0.06
 Upper Chest  |          0.05
 Lower Chest  |          0.05
 Side Delts   |          0.06
 Traps        |          0.05
 Serratus     |          0.07
 Upper Back   |          0.04
 Rear Delts   |          0.06
 Middle Back  |          0.04
 Rotator Cuff |          0.07
 Glutes       |          0.03
 Inner Thighs |          0.04
 Lower Back   |          0.04
 Core         |          0.07
 Stabilizers  |          0.07
 Adductors    |          0.04
 Lats         |          0.04
 Brachialis   |          0.06
 Forearms     |          0.06
 Abs          |          0.07
 Hip Flexors  |          0.06
 Obliques     |          0.07
 Calves       |          0.06
(29 rows)



blue=# SELECT * FROM onboarding_steps;
      step      
----------------
 welcome
 split_creation
 try_workout
 view_analytics
 next_steps
(5 rows)


blue=# SELECT * FROM personal_record;
 id | user_id | exercise_id | weight | reps | achieved_at 
----+---------+-------------+--------+------+-------------
(0 rows)


blue=# SELECT * FROM progress_media;
 id | measurement_id | media_type | media_url | created_at 
----+----------------+------------+-----------+------------
(0 rows)


blue=# SELECT * FROM set_type_templates;
 id | set_type_id | phase_number | rep_range_min | rep_range_max | weight_modifier | target_rest_period_seconds |         created_at         
----+-------------+--------------+---------------+---------------+-----------------+----------------------------+----------------------------
  1 |           1 |            1 |             8 |            12 |               1 |                         90 | 2025-02-18 05:19:40.229284
  2 |           2 |            1 |             8 |            12 |               1 |                          0 | 2025-02-18 05:19:40.229284
  3 |           2 |            2 |             8 |            12 |             0.8 |                          0 | 2025-02-18 05:19:40.229284
  4 |           2 |            3 |             8 |            12 |             0.6 |                         90 | 2025-02-18 05:19:40.229284
  5 |           3 |            1 |             8 |            12 |               1 |                          0 | 2025-02-18 05:19:40.229284
  6 |           3 |            2 |             8 |            12 |               1 |                         90 | 2025-02-18 05:19:40.229284
  7 |           4 |            1 |            10 |            15 |               1 |                          0 | 2025-02-18 05:19:40.229284
  8 |           4 |            2 |            10 |            15 |               1 |                          0 | 2025-02-18 05:19:40.229284
  9 |           4 |            3 |            10 |            15 |               1 |                          0 | 2025-02-18 05:19:40.229284
 10 |           4 |            4 |            10 |            15 |               1 |                         90 | 2025-02-18 05:19:40.229284
 11 |           5 |            1 |            12 |            15 |             0.8 |                         60 | 2025-02-18 05:19:40.229284
 12 |           5 |            2 |             8 |            12 |               1 |                         60 | 2025-02-18 05:19:40.229284
 13 |           5 |            3 |             6 |             8 |             1.2 |                         60 | 2025-02-18 05:19:40.229284
 14 |           6 |            1 |            10 |            15 |               1 |                         15 | 2025-02-18 05:19:40.229284
 15 |           6 |            2 |             5 |             8 |               1 |                         60 | 2025-02-18 05:19:40.229284
 16 |           7 |            1 |             2 |             3 |               1 |                         15 | 2025-02-18 05:19:40.229284
 17 |           7 |            2 |             2 |             3 |               1 |                         15 | 2025-02-18 05:19:40.229284
 18 |           7 |            3 |             2 |             3 |               1 |                         15 | 2025-02-18 05:19:40.229284
 19 |           7 |            4 |             2 |             3 |               1 |                         15 | 2025-02-18 05:19:40.229284
 20 |           8 |            1 |            10 |            15 |               1 |                          0 | 2025-02-18 05:19:40.229284
 21 |           8 |            2 |            10 |            15 |               1 |                          0 | 2025-02-18 05:19:40.229284
 22 |           8 |            3 |            10 |            15 |               1 |                         90 | 2025-02-18 05:19:40.229284
 23 |           9 |            1 |            12 |            15 |             0.5 |                          0 | 2025-02-18 05:19:40.229284
 24 |           9 |            2 |             8 |            12 |               1 |                         90 | 2025-02-18 05:19:40.229284
 25 |          10 |            1 |             6 |            10 |               1 |                         90 | 2025-02-18 05:19:40.229284
(25 rows)


blue=# SELECT * FROM set_types;
 id |           name           |         created_at         
----+--------------------------+----------------------------
  1 | Straight Sets            | 2025-02-18 05:19:06.889204
  2 | Drop Sets                | 2025-02-18 05:19:06.889204
  3 | Super Sets               | 2025-02-18 05:19:06.889204
  4 | Giant Sets               | 2025-02-18 05:19:06.889204
  5 | Pyramid Sets             | 2025-02-18 05:19:06.889204
  6 | Rest-Pause Sets          | 2025-02-18 05:19:06.889204
  7 | Cluster Sets             | 2025-02-18 05:19:06.889204
  8 | Mechanical Drop Sets     | 2025-02-18 05:19:06.889204
  9 | Pre-Exhaust Sets         | 2025-02-18 05:19:06.889204
 10 | Time Under Tension (TUT) | 2025-02-18 05:19:06.889204
(10 rows)



blue=# SELECT * FROM user_onboarding_steps;
 id  | user_id |      step      |        completed_at        
-----+---------+----------------+----------------------------
   1 |      33 | welcome        | 2025-03-13 02:57:01.151833
   3 |      33 | split_creation | 2025-03-13 02:57:03.582687
   4 |      33 | try_workout    | 2025-03-13 02:57:03.582687
   5 |      33 | view_analytics | 2025-03-13 02:57:03.582687
   6 |      33 | next_steps     | 2025-03-13 02:57:03.582687
 412 |      20 | welcome        | 2025-03-14 04:06:33.521219
 413 |      20 | split_creation | 2025-03-14 04:06:33.521219
 414 |      20 | try_workout    | 2025-03-14 04:06:33.521219
 415 |      20 | view_analytics | 2025-03-14 04:06:33.521219
 416 |      20 | next_steps     | 2025-03-14 04:06:33.521219
(10 rows)


blue=# SELECT * FROM user_set_executions;
 id  | user_id | set_type_id | exercise_id |    base_weight     |         created_at         
-----+---------+-------------+-------------+--------------------+----------------------------
   1 |       1 |           1 |           1 |                100 | 2025-02-19 02:30:29.33665
   2 |       1 |           2 |           5 |                100 | 2025-02-19 20:21:12.565693
   3 |       1 |           2 |           5 |                 12 | 2025-02-19 20:27:39.201403
   4 |       1 |           2 |           3 |                100 | 2025-02-23 22:16:02.520233
   5 |      20 |           4 |           8 | 24.947610018960187 | 2025-02-26 07:49:59.479223
   6 |      20 |           4 |           8 |  58.96707822663317 | 2025-02-26 07:57:05.269
   7 |      20 |           3 |          17 |  52.16318458509857 | 2025-02-26 07:58:10.091418
 200 |       1 |             |         100 |                225 | 2025-02-28 05:22:28.171071
   9 |      20 |           5 |           8 |  52.16318458509857 | 2025-03-15 05:47:37.936304
  11 |      20 |           5 |           8 |  52.16318458509857 | 2025-03-15 06:04:20.134018
(10 rows)


blue=# SELECT * FROM user_set_phase_executions;
 id | user_set_execution_id | phase_number | actual_reps |   actual_weight    | actual_rest_period_seconds |        completed_at        
----+-----------------------+--------------+-------------+--------------------+----------------------------+----------------------------
  1 |                     1 |            1 |          10 |                100 |                         60 | 2025-02-19 03:22:09.745777
  2 |                     4 |            1 |          12 |                100 |                         60 | 2025-02-23 22:16:02.520233
  3 |                     5 |            1 |          13 | 24.947610018960187 |                          0 | 2025-02-26 07:49:59.479223
  4 |                     5 |            2 |          13 |  20.41168092460379 |                          0 | 2025-02-26 07:49:59.479223
  5 |                     5 |            3 |          13 |  20.41168092460379 |                          0 | 2025-02-26 07:49:59.479223
  6 |                     5 |            4 |          13 |  20.41168092460379 |                          0 | 2025-02-26 07:49:59.479223
  7 |                     6 |            1 |           1 |  58.96707822663317 |                          0 | 2025-02-26 07:57:05.269
  8 |                     7 |            1 |          10 |  52.16318458509857 |                          0 | 2025-02-26 07:58:10.091418
  9 |                   200 |            1 |           1 |                225 |                         60 | 2025-02-28 05:22:35.332119
 10 |                     9 |            2 |          10 |  52.16318458509857 |                          0 | 2025-03-15 05:47:37.936304
 11 |                    11 |            2 |          10 |  52.16318458509857 |                          0 | 2025-03-15 06:04:20.134018
(11 rows)


blue=# SELECT * FROM user_workout_plan_sets;
 id | user_workout_plan_id | set_type_template_id | planned_base_weight | exercise_id 
----+----------------------+----------------------+---------------------+-------------
  1 |                    1 |                    3 |                 100 |            
  2 |                    1 |                    5 |                 100 |            
  6 |                    1 |                    5 |                 100 |            
  7 |                    2 |                    5 |                 100 |            
  8 |                    3 |                    1 |                 165 |            
  9 |                    3 |                    1 |                 335 |            
 10 |                    3 |                    1 |                  45 |            
 11 |                    3 |                    1 |                  45 |            
 12 |                    3 |                    1 |                 765 |            
 13 |                    3 |                    1 |                 325 |            
 14 |                    3 |                    1 |                 135 |            
 15 |                    4 |                    1 |                  55 |            
 16 |                    4 |                    1 |                  95 |            
 17 |                    3 |                    1 |                 135 |            
 18 |                    3 |                    1 |                  65 |            
 19 |                    5 |                    1 |                  45 |            
 20 |                    5 |                    1 |                  45 |            
 21 |                    3 |                    1 |                  45 |            
 22 |                    3 |                    1 |                  45 |            
 23 |                    3 |                    1 |                  45 |            
 24 |                    3 |                    1 |                 315 |            
 25 |                    3 |                    1 |                  45 |            
 26 |                    3 |                    1 |                  45 |            
 27 |                    3 |                    1 |                  45 |            
 28 |                    3 |                    1 |                  45 |            
 29 |                    3 |                    1 |                  45 |            
 30 |                    3 |                    1 |                  45 |            
 31 |                    3 |                    1 |                  95 |            
 32 |                    3 |                    1 |                  45 |            
 37 |                    6 |                    1 |                  45 |            
 38 |                    3 |                    6 |                  65 |            
 39 |                    7 |                    5 |                 115 |            
 40 |                    7 |                    5 |                 185 |            
 41 |                    7 |                    7 |                  55 |            
 42 |                    7 |                    5 |                 115 |          17
 43 |                    3 |                    4 |                 135 |           8
 44 |                    8 |                    4 |                 135 |           8
 45 |                    8 |                    6 |                  45 |           9
 46 |                    8 |                   11 |                  36 |          44
 47 |                    8 |                   12 |                  45 |          44
 48 |                    8 |                   13 |                  54 |          44
 49 |                    8 |                    7 |                  45 |           8
 50 |                    8 |                    8 |                  45 |           8
 51 |                    8 |                    9 |                  45 |           8
 52 |                    8 |                   10 |                  45 |           8
 53 |                    8 |                   14 |                1125 |          26
 54 |                    8 |                   15 |                1125 |          26
 56 |                    9 |                   12 |                 115 |           8
 57 |                    9 |                   13 |                 138 |           8
 58 |                    9 |                   11 |                  92 |          17
 59 |                    9 |                   12 |                 115 |          17
 60 |                    9 |                   13 |                 138 |          17
 62 |                   10 |                    1 |                   0 |           8
(53 rows)



blue=# SELECT * FROM user_workout_plans;
 id | user_id | scheduled_date |         created_at         
----+---------+----------------+----------------------------
  1 |       1 | 2025-02-21     | 2025-02-23 22:10:31.472874
  2 |       2 | 2025-02-21     | 2025-02-24 03:58:29.267627
  3 |      20 | 2025-02-24     | 2025-02-24 04:03:03.827521
  4 |      20 | 2025-02-12     | 2025-02-24 04:44:50.079867
  5 |      20 | 2025-02-02     | 2025-02-24 04:53:06.894366
  6 |      20 | 2024-12-10     | 2025-02-24 07:49:51.598462
  7 |      20 | 2025-02-25     | 2025-02-25 00:18:49.406347
  8 |      20 | 2025-02-26     | 2025-02-26 03:11:36.978602
  9 |      20 | 2025-03-14     | 2025-03-14 07:49:17.5903
 10 |      20 | 2025-03-15     | 2025-03-15 04:05:44.993386
(10 rows)



blue=# SELECT * FROM users;
 id |              email               |                          password_hash                           | google_auth |         created_at         | premium_status |       trial_started        | metric_system | newsletter | active |    trial_period_ends_at    | is_first_time_user 
----+----------------------------------+------------------------------------------------------------------+-------------+----------------------------+----------------+----------------------------+---------------+------------+--------+----------------------------+--------------------
 14 | lol2@gmail.com                   | $2a$10$r5oOfogUIRXzkC/8gKtQVua8k840skuLJwb2QCyu7FV5qRpTwHMGe     | f           | 2025-02-21 20:52:14.377136 | f              | 2025-02-21 14:52:28.914    | t             | f          | t      |                            | t
  1 | test@example.com                 | $2a$10$mItKZnpCq/yiTP4uopiYR.NZiPt//8FlqhF/JVZgiQgjiWvNhvFQ2     | f           | 2025-02-16 09:14:36.798547 | t              |                            | f             | f          | t      |                            | t
  2 | user@example.com                 | $2a$10$ihqer8WMTO6H/jDEO5nk4ujYyoG.zK1iXfheBC3bsmPgSBJMBEMpO     | f           | 2025-02-17 00:36:03.371177 | f              |                            | t             | f          | t      |                            | t
  4 | lol1@gmail.com                   | $2a$10$a57L4ahv3wNUIXm8R/tlJeDsKRP2oz4mIMskE/qmZsx0MVskTlM6m     | f           | 2025-02-19 02:32:33.124807 | f              |                            | t             | f          | t      |                            | t
  6 | wseemailaaa@gmail.com            | 0a1e86cd877cb817abe2a1a3c47f9ba92560c8a7e1132149107cb8fe97997784 | t           | 2025-02-20 22:28:20.804911 | f              |                            | t             | f          | t      |                            | t
  7 | 1@g.com                          | $2a$10$FHfTGXF0lzC0gPh5x4A9jO4x3J2hdLsYpmvy9inLEILMHZeSHFpmK     | f           | 2025-02-21 00:11:32.503659 | f              |                            | t             | f          | t      |                            | t
  8 | 2@g.com                          | $2a$10$v04Slb7gSmqdYtwZz9CgIuSilmGcdppyrgRDa3dpe9StE0scF.1uG     | f           | 2025-02-21 01:30:00.250527 | f              |                            | t             | f          | t      |                            | t
  9 | 3@g.com                          | $2a$10$tUmRdOtE5dQw2OoJe1jwNu5LSgot.hwRrhpi9HBGIZiRpqKBa6E8e     | f           | 2025-02-21 01:32:03.718701 | f              |                            | t             | f          | t      |                            | t
 25 | lol13h43@gmail.com               | $2a$10$zU4aTKLJlKZytgcqPeOD2.r/lFGyec6jFIAIiAmR2TJG4I95NhmNm     | f           | 2025-02-26 05:41:33.134072 | f              |                            | t             | f          | t      |                            | t
 15 | a@b.com                          | $2a$10$muQULj/eh2T0LUwSHNQtM.tFzTc9CCbGHycMAfwXrqA/Wr4Fc7166     | f           | 2025-02-21 20:53:11.402542 | f              | 2025-02-21 15:07:38.608    | t             | f          | t      |                            | t
 10 | 4@g.com                          | $2a$10$3fsViWmeSuY3H8XRAyef1u1xZuyBuLeX5zo51i.qZpBXRhUq7wWti     | f           | 2025-02-21 07:05:44.585599 | f              |                            | t             | f          | t      |                            | t
 11 | 5@g.com                          | $2a$10$jCEwvCKsaX9rxHVGemEZdO1Xnhlycnx3XEfNg/V8qvM20DeE3QaRi     | f           | 2025-02-21 07:08:32.658398 | f              |                            | t             | f          | t      |                            | t
 12 | gauygb@hsbx.com                  | f3d7e51ed12c6e1da1b608f35b677a60f05537fa1d64b64b32ac79bdfe801121 | t           | 2025-02-21 08:12:46.265688 | f              | 2025-02-22 01:43:21.811    | f             | f          | t      |                            | t
 16 | b@b.com                          | $2a$10$v9sA.rkiRoI6nKhg1Yl/d.WsUxhEwjNJAFWzv1Rutx07B.b5hB/R.     | f           | 2025-02-21 21:23:21.477057 | f              | 2025-02-21 15:24:38.905    | t             | f          | t      |                            | t
 17 | as@a.com                         | $2a$10$zHfFDZXdiSJx57YmvdPW6./MRvNKwzLZ0GIv1y6iydt4.1.5FyJrm     | f           | 2025-02-21 21:31:30.806957 | f              |                            | t             | f          | t      |                            | t
 27 | aba@aba.com                      | $2a$10$QaGBUE/JB.mmfubInb2IBubUhsLJ3q/N5CGl3VPYbEMIi8UOhDfb6     | f           | 2025-02-28 08:49:14.128971 | f              | 2025-02-28 08:49:14.272258 | t             | f          | t      | 2025-03-07 02:49:11.885    | t
 19 | f@gv.com                         | facbf2102a827f4649c1450b193602da62407a6e1b04e6b045318b676e2e0989 | t           | 2025-02-22 08:55:47.122923 | f              |                            | f             | f          | t      |                            | t
 28 | godputmehereforareason@gmail.com | bf445b19ee2e989cc18b8ea4fb882ddce91b448fc037edfa9d79863aefc613f8 | t           | 2025-03-01 00:59:11.557428 | f              | 2025-02-28 22:21:29.198    | t             | f          | t      | 2025-02-01 04:02:07.234693 | t
 33 | hihihihihi@hohohoho.com          | $2a$10$7xV1YNsZh.eVyJbRKHnfy.V1JTxLvTayb3CSmLK8Y8uPs492CqPxq     | f           | 2025-03-13 02:48:55.391107 | f              | 2025-03-13 02:48:55.45947  | t             | f          | t      | 2125-03-12 20:48:55.332    | f
 21 | aaa@a.com                        | $2a$10$NTQiHdPP0M65J7szVszkL.eGJfddikX1lt1FlvmlJy6zv.Jk2Ri/a     | f           | 2025-02-22 09:38:29.408359 | f              | 2025-02-22 04:04:29.416    | t             | f          | t      |                            | t
 20 | leezadda@gmail.com               | 36832b14a1f7e8c945594e638cf7d30e9feec73481805de7b59040d17f85042c | t           | 2025-02-22 09:18:14.197849 | t              | 2025-03-11 23:19:52.629    | f             | f          | t      | 2125-03-11 07:12:40.706754 | f
 13 | a@a.com                          | $2a$10$Ajxzo0942hxT12cc6vohpuEjRaWmm8GYLBlxvRyTp1n3Rm0Wt..Me     | f           | 2025-02-21 20:31:00.759046 | f              |                            | t             | f          | t      |                            | t
 31 | awa@awa.com                      | $2a$10$djWxHgf0ZA5f8lTc7zMGautNGaH.Fgyx4vVtAebFCTZcxXej8SZmi     | f           | 2025-03-12 20:01:51.597934 | f              | 2025-03-12 20:01:51.663792 | t             | f          | t      | 2125-03-12 14:01:51.341    | t
 18 | lol3@gmail.com                   | $2a$10$7TN59UU6EN9Ew4ARd1ueM.VaS0gV8QY5S/NTYBLVzpm.mmqOqY5.6     | f           | 2025-02-22 05:46:18.524736 | f              | 2025-02-21 23:50:10.001    | t             | f          | t      |                            | t
 32 | GY@yh.com                        | $2a$10$HnCt.bv1cC2NHLoMtTiBjOHlGT/wxVoyHz92PR4gvII0TpjbtDsRe     | f           | 2025-03-12 21:16:33.392882 | f              | 2025-03-12 21:16:33.458855 | t             | f          | t      | 2125-03-12 15:16:33.107    | t
 22 | lol33@gmail.com                  | $2a$10$PWE58I.yzpw8jdqFDru3OuKWq.daVA741khuNA2KykbM0voWRaxfi     | f           | 2025-02-23 22:06:40.685399 | f              |                            | t             | f          | t      |                            | t
  3 | lol@gmail.com                    | $2a$10$UQchtOPslPQrLj3AyobVfORDVIa1Ylaed5R4o6UxRj8Yh/mH.Q1ny     | f           | 2025-02-19 01:30:13.374567 | f              | 2025-02-21 14:51:15.572    | t             | f          | t      | 2025-02-28 00:29:30.422    | t
 23 | lol133@gmail.com                 | $2a$10$1DiGNYs0D4WxQNETrxb9.O49TA8hQT1dl2EQaWPVkKLvcBpfiQZjS     | f           | 2025-02-24 03:54:53.380572 | f              |                            | t             | f          | t      |                            | t
 24 | lol1343@gmail.com                | $2a$10$xQsxSqGsyW1u1LhNlOGw4uaKYq.DTvL3S/EvpACufOGQPL8/ZHGAm     | f           | 2025-02-24 09:08:56.229321 | f              |                            | t             | f          | t      |                            | t
 29 | heyyy@yahoo.com                  | $2a$10$TvN8jlWGyBFynaesBE441OPIRW2BhNy.9toOgu4.mSLRWZd.3Bdui     | f           | 2025-03-12 04:30:09.088358 | t              | 2025-03-11 22:30:11.47     | t             | f          | t      | 2125-03-11 22:30:08.998    | t
 30 | hoho@h.com                       | $2a$10$Zcz1KIXvZLA/f1AK./HRfeFCAyWtr1cZvQea57Rxbks.6qWwST3ia     | f           | 2025-03-12 04:33:10.365676 | f              | 2025-03-12 04:33:10.425109 | t             | f          | t      | 2125-03-11 22:33:10.269    | t
(31 rows)