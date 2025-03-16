const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Make sure to install this: npm install jsonwebtoken
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const pool = require('../../database/db.js');

// Create payment intent and return client secret
router.post('/create-payment-intent', async (req, res) => {
 
  
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('ERROR: Missing or invalid Authorization header');
    return res.status(401).json({ error: 'Invalid token. Access denied.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // JWT verification function - adjust secret key as needed
  try {
    // Replace 'your_jwt_secret' with your actual JWT secret from env variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Extract email from token payload
    const userEmail = decoded.email;
    
    if (!userEmail) {
      console.error('ERROR: Email not found in token payload');
      return res.status(400).json({ error: 'Invalid token payload' });
    }
    
   
   

    try {
      // First, look up the customer by email or create a new one
     
      const customers = await stripe.customers.list({ email: userEmail });
      
      let customer;
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
       
      } else {
       
        customer = await stripe.customers.create({ email: userEmail });
       
      }
      
      // For trial subscriptions, create a setup intent instead of payment intent
     
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ['card'],
        usage: 'off_session',
      });
     

      
      // Create a subscription with trial period
     
     
      
      try {
    // Create subscription without trial, charging immediately
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price_data: {
              currency: 'usd',
              product: 'prod_RZWrP07xc8c8mh',
              unit_amount: 2000, // Amount in cents (e.g., $20.00)
              recurring: { interval: 'month' }
            }
          }],
          // Remove trial_period_days entirely to start billing immediately
          payment_behavior: 'default_incomplete', // Creates a PaymentIntent that you'll need to confirm
          expand: ['latest_invoice.payment_intent'] // Expands the PaymentIntent details for client confirmation
        });

       
       
        
        // Database update for user trial status
        // FIXED: Also update premium_status to TRUE since subscription is active
       
        try {
          // Added premium_status = TRUE to fix the issue
          const dbResult = await pool.query(
            'UPDATE users SET trial_started = $1, premium_status = TRUE WHERE email = $2 RETURNING id, premium_status',
            [new Date(), userEmail]
          );
         
         
          
          if (dbResult.rowCount === 0) {
            console.warn(`WARNING: No user found in database with email ${userEmail}`);
          }
        } catch (dbError) {
          console.error('Database error when updating trial status and premium status:', dbError);
          console.error('SQL error details:', dbError.detail || 'No details available');
          console.error('Database error stack:', dbError.stack);
          // Continue processing despite DB error
        }
        
        // Return the client secret from the setup intent
       
        res.json({
          clientSecret: subscription.latest_invoice.payment_intent.client_secret,
          subscriptionId: subscription.id
        });
        
      } catch (subscriptionError) {
        console.error('ERROR CREATING SUBSCRIPTION:');
        console.error('Error message:', subscriptionError.message);
        console.error('Error type:', subscriptionError.type);
        console.error('Error code:', subscriptionError.code);
        console.error('Error param:', subscriptionError.param);
        if (subscriptionError.raw) {
          console.error('Raw error:', JSON.stringify(subscriptionError.raw));
        }
        throw subscriptionError; // Re-throw to be caught by outer catch block
      }
    } catch (error) {
      console.error('========= ERROR CREATING PAYMENT INTENT =========');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error type:', error.type);
      console.error('Error stack:', error.stack);
      if (error.raw) {
        console.error('Stripe raw error:', JSON.stringify(error.raw));
      }
      res.status(500).json({ 
        error: 'Failed to create payment intent',
        message: error.message,
        type: error.type || 'unknown' 
      });
    }
  } catch (jwtError) {
    console.error('ERROR: JWT verification failed', jwtError);
    return res.status(401).json({ error: 'Invalid token. Access denied.' });
  } finally {
   
  }
});

module.exports = router;