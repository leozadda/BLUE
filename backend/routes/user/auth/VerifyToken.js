const jwt = require('jsonwebtoken');

const VerifyToken = (req, res, next) => {
  // Get token from cookies instead of authorization header
  const token = req.cookies.auth_token;
  
 

  if (!token) {
    console.error('❌ VerifyToken: No auth_token cookie found');
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    
    // Check if the token is about to expire (less than 1 hour left)
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (tokenExp - now < oneHour) {
     
      
      // Create new token with fresh expiration
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Set the new token as a cookie
      res.cookie('auth_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });
      
     
    }

    // Attach user info to request object
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    
    // Clear the invalid cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
   
    
    return res.status(401).json({
      error: error.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid session. Please log in again.'
    });
  }
};

module.exports = VerifyToken;