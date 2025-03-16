// This file sets up our server and handles all our website's backend operations
const http = require('http');
const express = require('express');
const cors = require('cors');
// Add cookie-parser import
const cookieParser = require('cookie-parser');
const app = express();
const testServerConnection = require('./routes/test/TestDB.js');
const testDBConnection = require('./routes/test/TestServer.js');
const signUpNewUser = require('./routes/user/auth/Login.js');
const logInExistingUser = require('./routes/user/auth/SignUp.js');
const googleAuthentication = require('./routes/user/auth/GoogleAuth.js');
const getUserInfo = require('./routes/user/profile/GetUserInfo.js');
const VerifyToken = require('./routes/user/auth/VerifyToken.js');
const UpdateEmail = require('./routes/user/profile/UpdateEmail.js');
const UpdatePassword = require('./routes/user/profile/UpdatePassword.js');
const UpdateMembership = require('./routes/user/profile/UpdateMembership.js');
const UpdateUnits = require('./routes/user/preferences/UpdateUnits.js');
const SaveUserMeasurement = require('./routes/user/measurements/SaveUserMeasurement.js');
const GetLatestMeasurement = require('./routes/user/measurements/GetLatestMeasurement.js');
const CreateUserSplit = require('./routes/user/trash/0.js');
const GetUserSplit = require('./routes/user/trash/0000.js');
const UpdateUserSplit = require('./routes/user/trash/00.js');
const GetBodyWeightHistory = require('./routes/user/analytics/GetBodyweightHistory.js');
const GetStrengthHistory = require('./routes/user/analytics/GetStrengthHistory.js');
const GetMuscleSizeHistory = require('./routes/user/analytics/GetMuscleSizeHistory.js');
const GetPersonalRecords = require('./routes/user/analytics/GetPersonalRecords.js');
const GetVolumeHistory = require('./routes/user/analytics/GetVolumeHistory.js');
const GetRecoveryStatus = require('./routes/user/analytics/GetRecoveryStatus.js');
const CreatePaymentIntent = require('./routes/payment/CreatePaymentIntent.js');
const ListenForPaymentSuccess = require('./routes/payment/ListenForPaymentSuccess.js');
const CancelSubscription = require('./routes/payment/CancelSubscription.js');
const VerifyAuth = require('./routes/user/auth/VerifyAuth.js');
const OnboardingRoutes = require('./routes/user/onboard/Onboard.js');

const addSetToSplit = require('./routes/user/workout/AddSetToSplit.js');
const getAllSetTemplates = require('./routes/user/workout/GetAllSetTemplates.js');
const getSetsForDay = require('./routes/user/workout/GetSetsForDay.js');
const logCompletedSet = require('./routes/user/workout/LogCompletedSet.js');
const removeSetFromSplit = require('./routes/user/workout/RemoveSetFromSplit.js');
const searchForExercise = require('./routes/user/workout/SearchForExercise.js');
const { verify } = require('crypto');

require('dotenv').config();

// LOCAL DEVELOPMENT HTTP SERVER
const PORT = process.env.SERVER_PORT || 3000;
http.createServer(app).listen(PORT, () => {
    console.log(`Local development server running on port ${PORT}`);
});

// ======================== COOP and COEP Headers ========================
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// ======================== CORS CONFIGURATION ==========================
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3001',
            'https://www.b-lu-e.com',
            'https://b-lu-e.com'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['New-Token'], // Allow the browser to access that header from your frontend code
    credentials: true
}));

// ======================== COOKIE PARSER ==============================
// Add cookie parser middleware BEFORE request logging and other middleware
// This middleware parses the cookies attached to the client request
// and populates req.cookies with an object keyed by the cookie names
console.log('🍪 Setting up cookie parser middleware');
app.use(cookieParser());

// ======================== REQUEST LOGGING ============================
`app.use((req, res, next) => {
    console.log('\n-------- New Request Received --------');
    console.log('Time:', new Date().toISOString());
    console.log('Type of request:', req.method);
    console.log('Request to:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request query:', req.query);
    console.log('Request cookies:', req.cookies); // Now we can log cookies too
    console.log('--------------------------------------\n');
    next();
});`

// ======================== IMPORTANT SETTINGS =========================
console.log('Our important settings:');
console.log('Database user:', process.env.DB_USER);
console.log('Database location:', process.env.DB_HOST);
console.log('Database name:', process.env.DB_NAME);
console.log('Database port:', process.env.DB_PORT);
console.log('Server port:', process.env.SERVER_PORT);
console.log('Secret key for login:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log('Secret key for refresh:', process.env.REFRESH_TOKEN_SECRET ? 'Set' : 'Missing');
console.log('Stripe secret key:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Missing');
console.log('Stripe webhook secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Missing');
console.log('Stripe price ID:', process.env.STRIPE_PRICE_ID ? 'Set' : 'Missing');

// ======================== BODY PARSING MIDDLEWARE ========================
// Parse raw body for Stripe webhook verification first
app.use('/webhook', express.raw({ type: 'application/json' }));

// Then parse JSON for the rest of the routes
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

app.use(express.urlencoded({ extended: true }));

// This is redundant and could cause issues. Remove or comment it out since we already
// configured CORS above.
// app.use(cors({ origin: 'http://localhost:3001', credentials: true }));

// ======================== API ROUTES ================================
// Test routes
app.use(testServerConnection);
app.use(testDBConnection);

// Auth routes
app.use(signUpNewUser);
app.use(logInExistingUser);
app.use(googleAuthentication);

// Fix the verify-auth route - use the correct order
// First apply the VerifyToken middleware, then the route handler
app.use('/verify-auth', VerifyToken, (req, res) => {
    // If the middleware passes, the user is authenticated
    res.json({ 
        authenticated: true,
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

// This line might be causing issues - it should come after specific routes
// and act as a global middleware for protected routes
app.use(VerifyAuth);

//Onboarding user routes
app.use('/onboarding/status', VerifyToken);
app.use('/onboarding/complete-steps', VerifyToken);
app.use('/onboarding/complete', VerifyToken); 
app.use('/onboarding/reset', VerifyToken);
app.use(OnboardingRoutes);

// User info routes
app.use('/get-user-info', VerifyToken);
app.use(getUserInfo);

// User profile routes
app.use('/update-email', VerifyToken);
app.use(UpdateEmail);

app.use('/update-membership', VerifyToken);
app.use(UpdateMembership);

app.use('/update-password', VerifyToken);
app.use(UpdatePassword);

app.use('/update-units', VerifyToken);
app.use(UpdateUnits);

// Measurement routes
app.use('/save-user-measurement', VerifyToken);
app.use(SaveUserMeasurement);

app.use('/get-latest-measurement', VerifyToken);
app.use(GetLatestMeasurement);

// Split routes
app.use('/create-user-plit', VerifyToken);
app.use(CreateUserSplit);

app.use('/get-user-split', VerifyToken);
app.use(GetUserSplit);

app.use('/update-user-split', VerifyToken);
app.use(UpdateUserSplit);

// Analytics routes
app.use('/get-bodyweight-history', VerifyToken);
app.use(GetBodyWeightHistory);

app.use('/get-strength-history', VerifyToken);
app.use(GetStrengthHistory);

app.use('/muscle-size-history', VerifyToken);
app.use(GetMuscleSizeHistory);

app.use('/get-personal-records', VerifyToken);
app.use(GetPersonalRecords);

app.use('/muscle-volume-history', VerifyToken);
app.use(GetVolumeHistory);

app.use('/muscle-recovery-status', VerifyToken);
app.use(GetRecoveryStatus);

// Payment routes
app.use('/create-payment-intent', VerifyToken);
app.use(CreatePaymentIntent);

app.use('/cancel-subscription', VerifyToken);
app.use(CancelSubscription);

// Webhook route - no token verification for webhooks
app.use(ListenForPaymentSuccess);

// Workout routes
app.use('/add-set-to-split', VerifyToken);
app.use(addSetToSplit);

app.use('/get-all-set-templates', VerifyToken);
app.use(getAllSetTemplates);

app.use('/get-sets-for-day', VerifyToken);
app.use(getSetsForDay);

app.use('/log-completed-set', VerifyToken);
app.use(logCompletedSet);

app.use('/remove-set-from-split', VerifyToken);
app.use(removeSetFromSplit);

app.use('/search-for-exercise', VerifyToken);
app.use(searchForExercise);

// ======================== ERROR HANDLING ============================
app.use((err, req, res, next) => {
    console.error('💥 Error caught by error handler:', err.stack);
    res.status(500).send('Something broke!');
});