const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../../database/db.js');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    try {
      // Check if the user already exists
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists. Please log in.' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert new user using password_hash column instead of password
      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, hashedPassword]
      );
      
      const userId = newUser.rows[0].id;
     
      
      // Set up "indefinite" trial by using a very distant future date (100 years from now)
      const now = new Date();
      const farFutureTrial = new Date(now);
      farFutureTrial.setFullYear(now.getFullYear() + 100); // 100 years in the future
      
      // Start free trial
     
      await pool.query(
        'UPDATE users SET trial_started = NOW(), trial_period_ends_at = $1, premium_status = FALSE WHERE id = $2',
        [farFutureTrial, userId]
      );
     
  
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.rows[0].id, 
          email: newUser.rows[0].email 
        },
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
      
     
  
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;