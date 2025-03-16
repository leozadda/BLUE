-- Create a separate table for progress media
CREATE TABLE progress_media (
    id SERIAL PRIMARY KEY,
    measurement_id INTEGER REFERENCES measurement(id),
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('photo', 'video')),
    media_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revised measurement table
CREATE TABLE measurement (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Using numeric for all measurements to handle any reasonable value
    body_weight NUMERIC,
    arms NUMERIC,
    thighs NUMERIC,
    calves NUMERIC,
    waist NUMERIC,
    forearms NUMERIC,
    chest NUMERIC,
    
    -- Less restrictive check constraints
    CONSTRAINT positive_measurements 
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

CREATE INDEX idx_measurement_user_date ON measurement(user_id, date);
CREATE INDEX idx_progress_media_measurement ON progress_media(measurement_id);