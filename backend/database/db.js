const { Pool } = require('pg');
require('dotenv').config();

// Database Configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Log when database connections happen
pool.on('connect', () => {
   
});

// Log database errors
pool.on('error', (err) => {
    console.error('Database error occurred:', err);
    process.exit(-1);
});

module.exports = pool;
