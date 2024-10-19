// Import required modules
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));
app.use(express.json());  // Parse JSON request bodies

// Log environment variables for debugging
console.log('Environment variables:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('SERVER_PORT:', process.env.SERVER_PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Set' : 'Not set');

// Set up PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Log database connection details
console.log('Database connection details:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Test database connection route
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Database connection successful', timestamp: result.rows[0].now });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

// Signup route
app.post('/signup', async (req, res) => {
    console.log('Received signup request:', req.body);
    const { username, email, age, weight_kg, height_cm, sex, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user into database
        const result = await pool.query(
            'INSERT INTO users (username, email, age, weight_kg, height_cm, sex, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, created_at',
            [username, email, age, weight_kg, height_cm, sex, password_hash]
        );

        res.status(201).json({
            message: 'User successfully created',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Error during signup', details: error.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    console.log('Login attempt received:', req.body);
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        console.log('Login failed: Email or password missing');
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Find user in database
        console.log('Querying database for user');
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('Login failed: User not found');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare passwords
        console.log('User found, comparing passwords');
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            console.log('Login failed: Password mismatch');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        console.log('Password match, generating JWT');
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in the environment variables');
            return res.status(500).json({ error: 'Internal server error - JWT configuration issue' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Generate refresh token
        console.log('JWT generated, creating refresh token');
        if (!process.env.REFRESH_TOKEN_SECRET) {
            console.error('REFRESH_TOKEN_SECRET is not defined in the environment variables');
            return res.status(500).json({ error: 'Internal server error - Refresh token configuration issue' });
        }

        const refreshToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Send successful response
        console.log('Login successful, sending response');
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An internal server error occurred', details: err.message });
});

// Start the server
const port = process.env.SERVER_PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});