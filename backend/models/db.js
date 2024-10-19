const { Pool } = require('pg');

// Create a connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Function to create a new user in the database
async function createUser({ username, email, password_hash, age, weight_kg, height_cm, sex }) {
  const query = `
    INSERT INTO users (username, email, password_hash, age, weight_kg, height_cm, sex)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, username, email, age, weight_kg, height_cm, sex
  `;
  const values = [username, email, password_hash, age, weight_kg, height_cm, sex];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Function to get a user by their email
async function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

// Export the functions so they can be used in other files
module.exports = {
  createUser,
  getUserByEmail
};