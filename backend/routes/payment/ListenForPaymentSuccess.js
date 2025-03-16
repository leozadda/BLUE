const express = require('express');
const router = express.Router();
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../../database/db.js');

// Improved webhook endpoint - mostly keeping your existing implementation
router.post('/webhook', async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_SECRET_KEY;

    try {
        const event = stripe.webhooks.constructEvent(
            request.rawBody,
            sig,
            endpointSecret
        );

        // Handle customer.subscription.created event
        if (event.type === 'customer.subscription.created') {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer);
            
            await pool.query(
                'UPDATE users SET trial_period_ends_at = $1, premium_status = TRUE WHERE email = $2',
                [new Date(subscription.trial_end * 1000), customer.email]
            );
            
        }
        
        // Handle customer.subscription.updated event
        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer);
            
            if (subscription.status === 'active') {
                await pool.query(
                    'UPDATE users SET premium_status = TRUE WHERE email = $1',
                    [customer.email]
                );
               
            } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                await pool.query(
                    'UPDATE users SET premium_status = FALSE WHERE email = $1',
                    [customer.email]
                );
               
            }
        }
        
        // Handle successful payment events
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object;
            // Only process subscription invoices
            if (invoice.subscription) {
                const customer = await stripe.customers.retrieve(invoice.customer);
                
                await pool.query(
                    'UPDATE users SET premium_status = TRUE WHERE email = $1',
                    [customer.email]
                );
               
            }
        }
        
        // Handle failed payment events
        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object;
            if (invoice.subscription) {
                const customer = await stripe.customers.retrieve(invoice.customer);
                
                // Log the failure but don't change status yet - Stripe will retry
               
            }
        }

        response.json({received: true});
    } catch (err) {
        console.error('Webhook Error:', err.message);
        response.status(400).send(`Webhook Error: ${err.message}`);
    }
});

module.exports = router;