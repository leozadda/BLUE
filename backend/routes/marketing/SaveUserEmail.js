const express = require('express');
const router = express.Router();
require('dotenv').config();
const MailerLite = require('@mailerlite/mailerlite-nodejs').default;

const mailerlite = new MailerLite({
    api_key: process.env.MAILER_LITE
});

router.post('/save-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const params = {
            email: email,
            status: "active",
            subscribed_at: new Date().toISOString(),
        };
        
        const response = await mailerlite.subscribers.createOrUpdate(params);
        res.json({ 
            message: 'Subscriber created/updated successfully',
            data: response.data 
        });

    } catch (error) {
        console.error('MailerLite operation failed:', error);
        
        if (error.response) {
            return res.status(error.response.status || 500).json({ 
                error: 'MailerLite operation failed',
                details: error.response.data
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

module.exports = router;