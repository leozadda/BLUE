const express = require('express');
const VerifyToken = require('/Users/leo/Documents/blue/backend/routes/user/auth/VerifyToken.js');
const router = express.Router();

// Simple endpoint to verify if the user is authenticated
router.get('/verify-auth',(req, res) => {
 
  
  // If the middleware passes, the user is authenticated
  res.json({ 
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

module.exports = router;