// Import all the packages we need
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

// Load our environment variables from .env file
require('dotenv').config();

// Global logging middleware - logs every request that hits our server
const requestLogger = (req, res, next) => {
    console.log('\n=== Incoming Request ===');
    console.log('Time:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query Parameters:', JSON.stringify(req.query, null, 2));
    console.log('========================\n');
    next();
};

// Response logging middleware - logs what we're sending back
const responseLogger = (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;
    
    // Override the send function to log the response
    res.send = function(data) {
        console.log('\n=== Outgoing Response ===');
        console.log('URL:', req.url);
        console.log('Status:', res.statusCode);
        console.log('Body:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
        console.log('========================\n');
        
        // Call the original send function
        originalSend.call(this, data);
    };
    
    next();
};

// This function helps create a special signature for FatSecret API
function generateOAuthSignature(method, url, params, consumerSecret) {
    console.log('\n=== Generating OAuth Signature ===');
    console.log('Method:', method);
    console.log('URL:', url);
    console.log('Params:', params);
    
    const signatureBaseString = Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    console.log('Signature Base String:', signatureBaseString);
    
    const signatureBaseStringEncoded = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(signatureBaseString)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    
    const signature = crypto
        .createHmac('sha1', signingKey)
        .update(signatureBaseStringEncoded)
        .digest('base64');
        
    console.log('Generated Signature:', signature);
    console.log('========================\n');
    
    return signature;
}

// Create our Express app
const app = express();

// Add our logging middleware
app.use(requestLogger);
app.use(responseLogger);

// Set up CORS (Cross-Origin Resource Sharing)
// This allows our frontend to communicate with our backend
app.use(cors({
    origin: ['https://b-l-u-e.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Allow our app to understand JSON data
app.use(express.json());

// Set up database connection
let pool;
if (process.env.DATABASE_URL) {
    // Production database connection (Vercel)
    console.log('Setting up production database connection');
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10 // Connection pool limit for Vercel
    });
} else {
    // Local development database connection
    console.log('Setting up local database connection');
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });
}

// Log our environment settings
console.log('\n=== Environment Configuration ===');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('SERVER_PORT:', process.env.SERVER_PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Set' : 'Not set');
console.log('========================\n');

// Test database connection route
app.get('/test-db', async (req, res) => {
    console.log('\n=== Testing Database Connection ===');
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database connection successful');
        console.log('Database timestamp:', result.rows[0].now);
        res.json({ 
            success: true,
            message: 'Database connection successful', 
            timestamp: result.rows[0].now 
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Database connection failed', 
            details: error.message 
        });
    }
});

// Signup route
app.post('/signup', async (req, res) => {
    console.log('\n=== Processing Signup Request ===');
    console.log('Signup data:', req.body);
    
    const { username, email, age, weight_kg, height_cm, sex, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        console.log('Signup failed: Missing required fields');
        return res.status(400).json({ 
            success: false,
            error: 'Username, email, and password are required' 
        });
    }

    try {
        // Check if user already exists
        console.log('Checking for existing user');
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2', 
            [username, email]
        );
        
        if (existingUser.rows.length > 0) {
            console.log('Signup failed: User already exists');
            return res.status(400).json({ 
                success: false,
                error: 'Username or email already exists' 
            });
        }

        // Hash the password
        console.log('Hashing password');
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        console.log('Creating new user');
        const result = await pool.query(
            `INSERT INTO users (username, email, age, weight_kg, height_cm, sex, password_hash) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, username, email, created_at`,
            [username, email, age, weight_kg, height_cm, sex, password_hash]
        );

        console.log('User created successfully');
        res.status(201).json({
            success: true,
            message: 'User successfully created',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error during signup', 
            details: error.message 
        });
    }
});

// Login route
app.post('/login', async (req, res) => {
    console.log('\n=== Processing Login Request ===');
    console.log('Login attempt for email:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('Login failed: Missing credentials');
        return res.status(400).json({ 
            success: false,
            error: 'Email and password are required' 
        });
    }

    try {
        // Find user
        console.log('Searching for user');
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('Login failed: User not found');
            return res.status(400).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        const user = result.rows[0];

        // Check password
        console.log('Verifying password');
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            console.log('Login failed: Invalid password');
            return res.status(400).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        // Generate tokens
        console.log('Generating authentication tokens');
        if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
            console.error('Missing JWT configuration');
            return res.status(500).json({ 
                success: false,
                error: 'Internal server error - Authentication configuration issue' 
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Login successful');
        res.json({
            success: true,
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
        res.status(500).json({ 
            success: false,
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

// Add rate limiting with a simple delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Keep track of last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Minimum 1 second between requests

async function waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
        await delay(waitTime);
    }
    
    lastRequestTime = Date.now();
}

// Modified searchFoods function with rate limiting
async function searchFoods(foodName) {
    console.log('\n=== Searching Foods in FatSecret ===');
    console.log('Search Term:', foodName);
    
    await waitForRateLimit();
    
    const method = 'GET';
    const baseUrl = 'https://platform.fatsecret.com/rest/server/api';
    const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
    const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

    const params = {
        method: 'foods.search',
        search_expression: foodName,
        format: 'json',
        max_results: 10,  // Reduced from 50 to avoid rate limits
        page_number: 0,
        oauth_consumer_key: consumerKey,
        oauth_nonce: Math.random().toString(36).substring(2),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0'
    };

    params.oauth_signature = generateOAuthSignature(method, baseUrl, params, consumerSecret);

    try {
        console.log('Making API Request to FatSecret');
        const queryString = new URLSearchParams(params).toString();
        const url = `${baseUrl}?${queryString}`;
        
        const response = await axios.get(url);
        
        if (response.data.error) {
            if (response.data.error.includes('too many actions')) {
                console.log('Rate limit hit, retrying after delay...');
                await delay(2000); // Wait 2 seconds before retry
                return searchFoods(foodName); // Retry the request
            }
            throw new Error(`FatSecret API Error: ${response.data.error}`);
        }

        // Handle empty results
        if (!response.data.foods) {
            return { foods: { food: [] } };
        }

        return response.data;
    } catch (error) {
        console.error('FatSecret API Error:', error.message);
        if (error.response?.data?.error?.includes('too many actions')) {
            console.log('Rate limit hit in catch block, retrying after delay...');
            await delay(2000);
            return searchFoods(foodName);
        }
        throw error;
    }
}

// Modified getFoodDetails function with rate limiting
async function getFoodDetails(foodId) {
    console.log('\n=== Getting Food Details ===');
    console.log('Food ID:', foodId);
    
    await waitForRateLimit();
    
    const method = 'GET';
    const baseUrl = 'https://platform.fatsecret.com/rest/server/api';
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
        console.log('Making API Request for Food Details');
        const queryString = new URLSearchParams(params).toString();
        const url = `${baseUrl}?${queryString}`;
        
        const response = await axios.get(url);
        
        if (response.data.error) {
            if (response.data.error.includes('too many actions')) {
                console.log('Rate limit hit, retrying after delay...');
                await delay(2000);
                return getFoodDetails(foodId);
            }
            throw new Error(`FatSecret API Error: ${response.data.error}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error getting food details:', error);
        if (error.response?.data?.error?.includes('too many actions')) {
            console.log('Rate limit hit in catch block, retrying after delay...');
            await delay(2000);
            return getFoodDetails(foodId);
        }
        throw error;
    }
}

// Also modify your food search route to handle batches
app.get('/food-search/:foodName', async (req, res) => {
    console.log('\n=== Processing Food Search Request ===');
    console.log('Search term:', req.params.foodName);
    
    try {
        const searchResults = await searchFoods(req.params.foodName);
        
        if (!searchResults?.foods?.food) {
            console.log('No results found');
            return res.status(404).json({
                success: false,
                error: 'No results found',
                searchTerm: req.params.foodName
            });
        }

        // Convert to array if single result
        const foodArray = Array.isArray(searchResults.foods.food) 
            ? searchResults.foods.food 
            : [searchResults.foods.food];

        // Process foods in smaller batches to avoid rate limits
        const batchSize = 3;
        const foodDetails = [];
        
        for (let i = 0; i < foodArray.length; i += batchSize) {
            const batch = foodArray.slice(i, i + batchSize);
            const batchPromises = batch.map(item => getFoodDetails(item.food_id));
            const batchResults = await Promise.all(batchPromises);
            foodDetails.push(...batchResults);
            
            if (i + batchSize < foodArray.length) {
                await delay(2000); // Wait between batches
            }
        }

        console.log('Found', foodDetails.length, 'food items');

        res.json({
            success: true,
            searchTerm: req.params.foodName,
            resultsCount: foodDetails.length,
            foodDetails
        });
    } catch (error) {
        console.error('Food search error:', error);
        res.status(500).json({
            success: false,
            error: 'Food search failed',
            details: error.message
        });
    }
});

// --------------------------------------------------------------------------------
// No more json logs
// --------------------------------------------------------------------------------


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