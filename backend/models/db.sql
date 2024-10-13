-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,  -- Unique identifier for each user, automatically incremented
  username VARCHAR(50) UNIQUE NOT NULL,  -- User's chosen name, must be unique
  email VARCHAR(100) UNIQUE NOT NULL,  -- User's email, must be unique
  age INTEGER,  -- User's age
  weight_kg INTEGER,  -- User's weight
  height_cm INTEGER,  -- User's height
  sex VARCHAR(50), -- Male or Female
  password_hash VARCHAR(100) NOT NULL,  -- Encrypted password
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- When the user account was created
);

-- Food Items table
CREATE TABLE food_items (
  id SERIAL PRIMARY KEY,  -- Unique identifier for each food item
  name VARCHAR(100) NOT NULL,  -- Name of the food
  calories INTEGER NOT NULL,  -- Calorie count
  protein FLOAT,  -- Protein content in grams
  carbs FLOAT,  -- Carbohydrate content in grams
  fat FLOAT,  -- Fat content in grams
  serving_grams FLOAT, -- The setving size
);

-- Daily Logs table
CREATE TABLE daily_logs (
  id SERIAL PRIMARY KEY,  -- Unique identifier for each log entry
  user_id INTEGER REFERENCES users(id),  -- Links to the user who made this log so that we don't create daily log for EMPTY users
  date DATE NOT NULL,  -- Date of the log
  food_item_id INTEGER REFERENCES food_items(id),  -- Links to the food item logged
  quantity FLOAT NOT NULL,  -- How much of the food was eaten
  meal_type VARCHAR(20),  -- e.g., breakfast, lunch, dinner, snack
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- When this log was created
);