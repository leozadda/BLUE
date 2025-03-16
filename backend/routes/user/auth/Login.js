const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../../database/db.js');
const router = express.Router();

router.post('/login', async (req, res) => {
   
    const { email, password } = req.body;

    // Make sure we have an email and password
    if (!email || !password) {
       
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Look for the user in our database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
           
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Check if the password is correct
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
           
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Create JWT token
        if (!process.env.JWT_SECRET) {
            console.error('Missing JWT_SECRET!');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set HTTP-only cookie with the JWT token
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });
        
       

        // Send back the successful login response
        res.json({
            message: 'Login successful!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
            // No need to send tokens in the response body anymore
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// Add a logout route
router.post('/logout', (req, res) => {
   
    
    // Clear the auth cookie
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    
   
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;