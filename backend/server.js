// This file sets up our server and handles all our website's backend operations
const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();
// Loads our environment variables from .env file
const stripe = require('stripe')('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');


// Load SSL certificates with error handling
const sslOptions = {
    key: fs.readFileSync('./certs/privkey.pem'),
    cert: fs.readFileSync('./certs/fullchain.pem'),
    minVersion: 'TLSv1.2'
};

const app = express();
app.use(cors());
app.use(express.json()); // Move this line here, after app initialization but before routes

// HTTP server (redirect to HTTPS)
http.createServer((req, res) => {
    res.writeHead(301, { 
        'Location': `https://${req.headers.host}${req.url}`
    });
    res.end();
}).listen(80, () => {
    console.log('HTTP server running on port 80 (redirecting to HTTPS)');
}).on('error', err => {
    console.error('HTTP server error:', err);
});

// HTTPS server
https.createServer(sslOptions, app)
    .listen(443, () => {
        console.log('HTTPS server running on port 443');
    })
    .on('error', err => {
        console.error('HTTPS server error:', err);
    });

// Print out important startup information
console.log('=============== STARTING UP SERVER ===============');
console.log('What environment are we in:', process.env.NODE_ENV);
console.log('Where is our code running from:', process.cwd());
console.log('================================================');

// This function helps us talk to the FatSecret API securely
function generateOAuthSignature(method, url, params, consumerSecret) {
    console.log('Creating secure signature for FatSecret API');
    // Sort and combine all our parameters
    const signatureBaseString = Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    const signatureBaseStringEncoded = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(signatureBaseString)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    
    // Create and return the encrypted signature
    return crypto
        .createHmac('sha1', signingKey)
        .update(signatureBaseStringEncoded)
        .digest('base64');
}

// This function searches for foods in the FatSecret database
async function searchFoods(foodName) {
    console.log('Searching for food:', foodName);
    const method = 'GET';
    const baseUrl = process.env.BASE_FAT_SECRET_URL;
    const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
    const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

    // Set up the parameters for our API request
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

    // Add our secure signature
    params.oauth_signature = generateOAuthSignature(method, baseUrl, params, consumerSecret);

    try {
        // Make the request and return the results
        console.log('Sending request to FatSecret API');
        const response = await axios.get(baseUrl, { params });
        return response.data;
    } catch (error) {
        console.error('Something went wrong with the food search:', error.message);
        if (error.response) {
            console.error('API response error:', error.response.data);
            console.error('API response status:', error.response.status);
        }
    }
}

// This function gets detailed information about a specific food
async function getFoodDetails(foodId) {
    console.log('Getting details for food ID:', foodId);
    const method = 'GET';
    const baseUrl = process.env.BASE_FAT_SECRET_URL;
    const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
    const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

    // Set up the parameters for our API request
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




    // Add our secure signature
    params.oauth_signature = generateOAuthSignature(method, baseUrl, params, consumerSecret);

    try {
        // Make the request and return the results
        const response = await axios.get(baseUrl, { params });
        return response.data;
    } catch (error) {
        console.error('Something went wrong getting food details:', error.message);
        throw error;
    }
}



// Add some basic security and data parsing features
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.endsWith('.b-lu-e.com') || origin === 'https://www.b-lu-e.com') {
            callback(null, true); // Accept the origin
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the origin
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));


// Log when any request comes to our server
app.use((req, res, next) => {
    console.log('\n-------- New Request Received --------');
    console.log('Time:', new Date().toISOString());
    console.log('Type of request:', req.method);
    console.log('Request to:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request query:', req.query);
    console.log('--------------------------------------\n');
    next();
});

// Print out our important settings (for debugging)
console.log('Our important settings:');
console.log('Database user:', process.env.DB_USER);
console.log('Database location:', process.env.DB_HOST);
console.log('Database name:', process.env.DB_NAME);
console.log('Database port:', process.env.DB_PORT);
console.log('Server port:', process.env.SERVER_PORT);
console.log('Secret key for login:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log('Secret key for refresh:', process.env.REFRESH_TOKEN_SECRET ? 'Set' : 'Missing');

// Base URLs for the application
const YOUR_DOMAIN = 'https://api.b-lu-e.com';

// Database Configuration
const DB_USER = 'postgres';
const DB_HOST = '52.15.65.10';
const DB_NAME = 'blue';
const DB_PASSWORD = 'postgres';
const DB_PORT = 5432;

// Database connection
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT
});

// Log when database connections happen
pool.on('connect', () => {
    console.log('Successfully connected to database');
});

// Log database errors
pool.on('error', (err) => {
    console.error('Database error occurred:', err);
    process.exit(-1);
});

// Route to test if our database is working
app.get('/test', async (req, res) => {
    console.log('Testing database connection...');
    try {
        res.json({ message: 'Workeddd!'});
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({ error: 'Could not connect to database', details: error.message });
    }
});

// Route to test if our database is working
app.get('/test-db', async (req, res) => {
    console.log('Testing database connection...');
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database test successful!');
        res.json({ message: 'Database is working!', timestamp: result.rows[0].now });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({ error: 'Could not connect to database', details: error.message });
    }
});

// Route for creating a new user account
// Updated signup route to include trial period tracking
app.post('/signup', async (req, res) => {
    const { username, email, age, kg, cm, sex, password } = req.body;

    try {
        // Set trial period to 7 days from signup
        const trialPeriodEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert user with trial period information
        const result = await pool.query(
            'INSERT INTO users (username, email, age, weight_kg, height_cm, sex, password_hash, has_completed_payment, trial_period_ends_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, username, email',
            [username, email, age, kg, cm, sex, password_hash, false, trialPeriodEndsAt]
        );

        res.status(201).json({
            message: 'Account created successfully!',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Could not create account', details: error.message });
    }
});

// Route for logging in
app.post('/login', async (req, res) => {
    console.log('Login attempt received:', req.body);
    const { email, password } = req.body;

    // Make sure we have an email and password
    if (!email || !password) {
        console.log('Login failed: Missing email or password');
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Look for the user in our database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('Login failed: User not found');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Check if the password is correct
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            console.log('Login failed: Wrong password');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Create login tokens
        if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
            console.error('Missing security keys!');
            return res.status(500).json({ error: 'Server configuration error' });
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

        // Send back the successful login response
        res.json({
            message: 'Login successful!',
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
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// Route to search for foods
app.get('/food-search/:foodName', async (req, res) => {
    const foodName = req.params.foodName;
    console.log('Searching for food:', foodName);
    
    try {
        // Search for the foods
        const searchResults = await searchFoods(foodName);
        
        // Get detailed information for each food found
        const foodDetailsPromises = searchResults.foods.food.map(item => {
            return getFoodDetails(item.food_id);
        });

        const foodDetails = await Promise.all(foodDetailsPromises);
        res.json({ foodDetails });
    } catch (error) {
        console.error('Error searching for food:', error);
        res.status(500).json({ error: 'Food search failed' });
    }
});

// Route to log food eaten
app.post('/log-food', async (req, res) => {
    const { user_id, food_item, date, quantity, meal_type } = req.body;
    console.log('Logging food for user:', user_id);

    try {
        // First, find or create the food item
        console.log('Finding/creating food item:', food_item);
        const foodItemResponse = await axios.post('http://localhost:3001/search-or-create-food', food_item);
        const food_item_id = foodItemResponse.data.id;

        // Then, create the food log entry
        console.log('Creating food log entry');
        const query = `
            INSERT INTO daily_logs (user_id, food_item_id, date, quantity, meal_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;
        const values = [user_id, food_item_id, new Date(date), quantity, meal_type];
        
        const result = await pool.query(query, values);
        console.log('Food log created:', result.rows[0]);
        
        res.status(201).json(result.rows[0]);
        
    } catch (error) {
        console.error('Error logging food:', error);
        res.status(500).json({ error: 'Could not log food', details: error.message });
    }
});

// Route to get a user's food log for a specific day
app.get('/user-daily-log', async (req, res) => {
    const { user_id, date } = req.query;
    console.log('Getting food log for user:', user_id, 'on date:', date);

    if (!user_id || !date) {
        return res.status(400).json({ error: 'Missing user ID or date' });
    }
    try {
        // Get all food logs for the specified day
        const query = `
            SELECT 
                dl.id, dl.date, dl.quantity, dl.meal_type,
                fi.name as food_name, fi.calories, fi.protein, fi.fat, fi.carbs,
                fi.saturated_fat, fi.fiber, fi.sugar, fi.sodium
            FROM daily_logs dl
            JOIN food_items fi ON dl.food_item_id = fi.id
            WHERE dl.user_id = $1 AND dl.date = $2
            ORDER BY dl.meal_type, dl.id
        `;

        console.log('Executing query:', query);
        const result = await pool.query(query, [user_id, date]);

        // Calculate actual nutritional values based on portion size
        const calculatedResults = result.rows.map(row => {
            const factor = row.quantity / 100;  // Assuming serving sizes are in 100g units
            const calculated = {};
            
            // Multiply each nutritional value by the portion size
            for (const [key, value] of Object.entries(row)) {
                if (typeof value === 'number' && key !== 'id' && key !== 'quantity') {
                    calculated[key] = value * factor;
                } else {
                    calculated[key] = value;
                }
            }
            
            return calculated;
        });

        res.json(calculatedResults);
    } catch (error) {
        console.error('Error getting food log:', error);
        res.status(500).json({ error: 'Could not get food log', details: error.message });
    }
});

// ------------------------ STRIPE BOILERPLATE ----------------------------

// Move this BEFORE any other middleware that parses the body
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
      // For webhook route, use raw body
      let data = '';
      req.setEncoding('utf8');
      req.on('data', chunk => { 
        data += chunk;
      });
      req.on('end', () => {
        req.rawBody = data;
        next();
      });
    } else {
      next();
    }
  });
  



// Webhook endpoint for handling Stripe payment events
app.post('/webhook', async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = 'whsec_hi44dqSeF3DUm7IozN7ZUnBHFGbFjFz3';

    try {
        const event = stripe.webhooks.constructEvent(
            request.rawBody,
            sig,
            endpointSecret
        );

        if (event.type === 'customer.subscription.created') {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer);
            
            //not sure if this is working
            await pool.query(
                'UPDATE users SET trial_period_ends_at = $1, has_completed_payment = TRUE WHERE email = $2',
                [new Date(subscription.trial_end * 1000), customer.email]
            );
        }
        
        if (event.type === 'customer.subscription.updated' || 
            event.type === 'invoice.payment_succeeded') {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer);

            //not sure if this is working
            await pool.query(
                'UPDATE users SET has_completed_payment = TRUE WHERE email = $1',
                [customer.email]
            );
        }

        response.json({received: true});

    } catch (err) {
        console.error('Webhook Error:', err.message);
        response.status(400).send(`Webhook Error: ${err.message}`);
    }
});

  // AFTER webhook route, add body parsers
  app.use(express.json());

// Improved payment status verification endpoint
app.get('/verify-payment-status', async (req, res) => {
    const { email } = req.query;
   
    try {
        const result = await pool.query(
            'SELECT has_completed_payment, trial_period_ends_at FROM users WHERE email = $1',
            [email]
        );
    
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        const { has_completed_payment, trial_period_ends_at } = result.rows[0];
        const now = new Date();
        
        // Check if user has paid or is still within trial period
        const hasActiveAccess = has_completed_payment || 
            (trial_period_ends_at && new Date(trial_period_ends_at) > now);
        
        res.json({
            email,
            hasCompletedPayment: hasActiveAccess,
            trialEndsAt: trial_period_ends_at
        });
    } catch (error) {
        console.error('Error verifying payment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  // Update your existing create-checkout-session endpoint
app.post('/create-checkout-session', async (req, res) => {
    console.log("Received request to create checkout session");
  
    const hardCodedPriceId = "price_1QgNnfFQmWdO1D5cVOO5rQJ2";
  
    try {
      console.log("Creating checkout session with price ID:", hardCodedPriceId);
  
      const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
          {
            price: hardCodedPriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 7,
        },

        // Update success_url to use the correct domain
        success_url: 'https://www.b-lu-e.com/dashboard',
        cancel_url: 'https://www.b-lu-e.com/error',
        // Collect customer email
        customer_email: req.body.email // Make sure to pass the user's email from your signup form
      });
  
      console.log("Checkout session created successfully:", session.url);
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  // ------------------------- END STRIPE BOILERPLATE ----------------------

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});