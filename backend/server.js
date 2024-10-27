// Import all the packages we need
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

// Load our environment variables
require('dotenv').config();

// This function helps create a special signature for FatSecret API
function generateOAuthSignature(method, url, params, consumerSecret) {
    const signatureBaseString = Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    const signatureBaseStringEncoded = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(signatureBaseString)}`;
    
    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    
    return crypto
        .createHmac('sha1', signingKey)
        .update(signatureBaseStringEncoded)
        .digest('base64');
}

// Function to search foods in FatSecret API
async function searchFoods(foodName) {
    const method = 'GET';
    const baseUrl = process.env.BASE_FAT_SECRET_URL;
    const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
    const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

    const params = {
        method: 'foods.search',
        search_expression: foodName,
        format: 'json',
        oauth_consumer_key: consumerKey,
        oauth_nonce: Math.random().toString(36).substring(2),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0'
    };

    params.oauth_signature = generateOAuthSignature(method, baseUrl, params, consumerSecret);

    try {
        const response = await axios.get(baseUrl, { params });
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
    }
}

// Function to get detailed info about a specific food
async function getFoodDetails(foodId) {
    const method = 'GET';
    const baseUrl = process.env.BASE_FAT_SECRET_URL;
    const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
    const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

    const params = {
        method: 'food.get',
        food_id: foodId,
        format: 'json',
        oauth_consumer_key: consumerKey,
        oauth_nonce: Math.random().toString(36).substring(2),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0'
    };

    params.oauth_signature = generateOAuthSignature(method, baseUrl, params, consumerSecret);

    try {
        const response = await axios.get(baseUrl, { params });
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
}

// Create our Express app
const app = express();

/* Set up security and data parsing (FUTURE CODE MAYBE)
app.use(cors({
    origin: 'https://b-l-u-e.vercel.app',  // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));
*/
app.use(cors({
    origin: '*', // Allow all origins
    methods: '*', // Allow all HTTP methods
    allowedHeaders: '*' // Allow all headers
  }));

app.use(express.json());  // Let our app understand JSON data

// Set up database connection for Vercel
let pool;
if (process.env.DATABASE_URL) {
    // Production database connection
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10 // Connection pool limit for Vercel
    });
} else {
    // Local development connection
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });
};

// Print our environment settings (keeping your existing logging)
console.log('Environment variables:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('SERVER_PORT:', process.env.SERVER_PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Set' : 'Not set');

// [ALL YOUR EXISTING ROUTES STAY EXACTLY THE SAME]
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

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

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

    if (!email || !password) {
        console.log('Login failed: Email or password missing');
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        console.log('Querying database for user');
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('Login failed: User not found');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        console.log('User found, comparing passwords');
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            console.log('Login failed: Password mismatch');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

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

// Food search routes
app.get('/food-search/:foodName', async (req, res) => {
    const foodName = req.params.foodName;
    
    const searchResults = await searchFoods(foodName);
    
    const foodDetailsPromises = searchResults.foods.food.map(item => {
        return getFoodDetails(item.food_id);
    });

    const foodDetails = await Promise.all(foodDetailsPromises);

    res.json({ foodDetails });
});

app.post('/api/logFood', async (req, res) => {
    try {
        const { userId, foodLogs } = req.body;

        if (!userId || !foodLogs || !Array.isArray(foodLogs)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        for (let log of foodLogs) {
            const {
                foodItemId,
                quantity,
                mealType,
                calories,
                protein,
                fat,
                carbs,
                saturatedFat,
                transFat,
                fiber,
                sugar,
                sodium,
                cholesterol,
                vitaminA,
                vitaminC,
                calcium,
                iron
            } = log;

            const result = await pool.query(`
                INSERT INTO daily_logs (user_id, food_item_id, quantity, meal_type, date, 
                                        calories, protein, fat, carbs, saturated_fat, trans_fat, 
                                        fiber, sugar, sodium, cholesterol, vitaminA, vitaminC, 
                                        calcium, iron)
                VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
                        $14, $15, $16, $17, $18)
                RETURNING id
            `, [userId, foodItemId, quantity, mealType, calories, protein, fat, carbs, saturatedFat,
                transFat, fiber, sugar, sodium, cholesterol, vitaminA, vitaminC, calcium, iron]);

            console.log('Food log ID:', result.rows[0].id);
        }

        res.status(200).json({ message: 'Food logs saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/search-or-create-food', async (req, res) => {
    const {
      name, calories, protein, fat, carbs, saturated_fat, monounsaturated_fat,
      polyunsaturated_fat, trans_fat, fiber, sugar, sodium, cholesterol,
      potassium, vitaminA, vitaminC, calcium, iron, vitaminD, vitaminE,
      vitaminK, magnesium, zinc, phosphorus, omega_3, omega_6, serving_size, serving_unit, is_manual
    } = req.body;
  
    console.log('Received food item data:', req.body);
  
    try {
        console.log('Searching for existing food item with name:', name);
        const searchResult = await pool.query(
            `SELECT id FROM food_items WHERE name = $1 LIMIT 1`, [name]
        );
  
        if (searchResult.rows.length > 0) {
            console.log('Food item found with ID:', searchResult.rows[0].id);
            return res.status(200).json({ id: searchResult.rows[0].id });
        }
  
        console.log('Inserting new food item:', name);
        const insertResult = await pool.query(
            `INSERT INTO food_items (name, calories, protein, fat, carbs, saturated_fat, monounsaturated_fat,
            polyunsaturated_fat, trans_fat, fiber, sugar, sodium, cholesterol, potassium, vitamina, vitaminc,
            calcium, iron, vitamind, vitamine, vitamink, magnesium, zinc, phosphorus, omega_3, omega_6,
            serving_size, serving_unit, is_manual)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
            RETURNING id`,
            [
            name, calories, protein, fat, carbs, saturated_fat, monounsaturated_fat, polyunsaturated_fat,
            trans_fat, fiber, sugar, sodium, cholesterol, potassium, vitaminA, vitaminC, calcium, iron,
            vitaminD, vitaminE, vitaminK, magnesium, zinc, phosphorus, omega_3, omega_6, serving_size,
            serving_unit, is_manual
            ]
        );
  
        console.log('New food item inserted with ID:', insertResult.rows[0].id);
        return res.status(201).json({ id: insertResult.rows[0].id });
  
    } catch (error) {
        console.error('Error searching or creating food item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/log-food', async (req, res) => {
    const { user_id, food_item, date, quantity, meal_type } = req.body;

    console.log('Received daily log data:', req.body);

    try {
        // Step 1: Search or create the food item
        console.log('Calling /search-or-create-food with:', food_item);
        // Update the URL to use environment variable for production
        const apiUrl = process.env.VERCEL 
            ? process.env.VERCEL_URL 
            : 'http://localhost:3001';
        const foodItemResponse = await axios.post(`${apiUrl}/search-or-create-food`, food_item);
        const food_item_id = foodItemResponse.data.id;

        console.log('Food item ID returned from /search-or-create-food:', food_item_id);

        // Step 2: Insert the daily log
        console.log('Inserting daily log for user:', user_id);
        const query = `
            INSERT INTO daily_logs (user_id, food_item_id, date, quantity, meal_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;
        const values = [user_id, food_item_id, new Date(date), quantity, meal_type];
        
        console.log('Executing query:', query);
        console.log('With values:', values);

        const result = await pool.query(query, values);

        console.log('Query result:', result);
        console.log('Daily log inserted with ID:', result.rows[0].id);
        
        res.status(201).json(result.rows[0]);
        
    } catch (error) {
        console.error('Error adding daily food log:', error);
        if (error.response && error.response.data) {
            res.status(500).json({ error: 'Internal server error', details: error.response.data });
        } else {
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
});

app.get('/user-daily-log', async (req, res) => {
    const { user_id, date } = req.query;

    console.log('Received /user-daily-log request with parameters:', { user_id, date });

    if (!user_id || !date) {
        console.error('Missing user_id or date parameter');
        return res.status(400).json({ error: 'Missing user_id or date parameter' });
    }

    try {
        const query = `
            SELECT 
                dl.id, dl.date, dl.quantity, dl.meal_type,
                fi.name as food_name, fi.calories, fi.protein, fi.fat, fi.carbs,
                fi.saturated_fat, fi.monounsaturated_fat, fi.polyunsaturated_fat,
                fi.trans_fat, fi.fiber, fi.sugar, fi.sodium, fi.cholesterol,
                fi.potassium, fi.vitamina, fi.vitaminc, fi.calcium, fi.iron,
                fi.vitamind, fi.vitamine, fi.vitamink, fi.magnesium, fi.zinc,
                fi.phosphorus, fi.omega_3, fi.omega_6, fi.serving_size, fi.serving_unit
            FROM daily_logs dl
            JOIN food_items fi ON dl.food_item_id = fi.id
            WHERE dl.user_id = $1 AND dl.date = $2
            ORDER BY dl.meal_type, dl.id
        `;

        const values = [user_id, date];

        console.log('Executing query:', query);
        console.log('With values:', values);

        const result = await pool.query(query, values);

        console.log('Query result:', result.rows);

        const calculatedResults = result.rows.map(row => {
            const factor = row.quantity / (row.serving_size / 100);
            const calculated = {};
        
            console.log(`Calculating nutrition for food item: ${row.food_name}`);
            console.log(`Quantity consumed: ${row.quantity}${row.serving_unit}`);
            console.log(`Serving size: ${row.serving_size}${row.serving_unit}`);
            console.log(`Calculation factor: ${factor}`);
        
            for (const [key, value] of Object.entries(row)) {
                if (typeof value === 'number' && key !== 'id' && key !== 'quantity' && key !== 'serving_size') {
                    calculated[key] = value * factor;
                    console.log(`${key}: ${value} * ${factor} = ${calculated[key]}`);
                } else {
                    calculated[key] = value;
                }
            }
        
            console.log('Calculated result for food item:', calculated);
            return calculated;
        });

        console.log('Sending calculated results:', calculatedResults);
        res.json(calculatedResults);
    } catch (error) {
        console.error('Error fetching user daily log:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An internal server error occurred', details: err.message });
});

// Modified server startup for Vercel
if (process.env.VERCEL) {
    // Export the app for Vercel serverless deployment
    module.exports = app;
} else {
    // Start the server normally for local development
    const port = process.env.SERVER_PORT || 3001;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}


/*


and how is the postgresSQL database handled? doen't it need to connstantly run? how does this work on headless and what shouuld i specifically do with my project?


*/