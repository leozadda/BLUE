const express = require('express');
const pool = require('../../../database/db.js');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); 

router.use(express.json());

router.post('/google-login', async (req, res) => {
    const token = req.body.token;

    if (!token) {
        console.error('❌ No token found in request body');
        return res.status(400).json({ error: 'No token found in the body' });
    }

    try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!userInfoResponse.ok) {
            throw new Error('Failed to verify token with Google');
        }

        const userInfo = await userInfoResponse.json();

        try {
            const existingUser = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [userInfo.email]
            );

            let userId;
            let isNewUser = false;
            
            if (existingUser.rows.length === 0) {
                isNewUser = true;
                const placeholderPasswordHash = crypto.randomBytes(32).toString('hex');
                
                const result = await pool.query(
                    'INSERT INTO users (email, password_hash, google_auth, created_at, metric_system, newsletter, active) VALUES ($1, $2, TRUE, NOW(), TRUE, FALSE, TRUE) RETURNING id',
                    [userInfo.email, placeholderPasswordHash]
                );
                userId = result.rows[0].id;
               
                
                // Set up "indefinite" trial by using a very distant future date (100 years from now)
                const now = new Date();
                const farFutureTrial = new Date(now);
                farFutureTrial.setFullYear(now.getFullYear() + 100); // 100 years in the future
                
                // Start free trial
               
                await pool.query(
                    'UPDATE users SET trial_started = NOW(), trial_period_ends_at = $1, premium_status = FALSE WHERE id = $2',
                    [farFutureTrial, userId]
                );
               
            } else {
                userId = existingUser.rows[0].id;
                
                await pool.query(
                    'UPDATE users SET google_auth = TRUE WHERE id = $1 AND google_auth = FALSE',
                    [userId]
                );
                
                // If user doesn't have trial info, add it
                if (!existingUser.rows[0].trial_started) {
                    const now = new Date();
                    const trialEndDate = new Date(now);
                    trialEndDate.setDate(now.getDate() + 7);
                    
                   
                    await pool.query(
                        'UPDATE users SET trial_started = NOW(), trial_period_ends_at = $1, premium_status = FALSE WHERE id = $2 AND trial_started IS NULL',
                        [trialEndDate, userId]
                    );
                   
                }
                
               
            }

            // Generate JWT token
            const jwtToken = jwt.sign(
                { 
                    userId: userId, 
                    email: userInfo.email 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' } // Extended expiration time since we're using HTTP-only cookies
            );

            // Set HTTP-only cookie with the JWT token
            res.cookie('auth_token', jwtToken, {
                httpOnly: true, // Prevents JavaScript access
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                sameSite: 'strict', // Prevents CSRF attacks
                maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                path: '/' // Available across the entire site
            });
            
           

            // Send response (no need to send token in body anymore)
            res.json({
                success: true,
                isNewUser: isNewUser
            });

        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            throw dbError;
        }
        
    } catch (error) {
        console.error('❌ Error details:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;