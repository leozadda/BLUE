// routes/user/profile/CancelSubscription.js
const express = require('express');
const router = express.Router();
const pool = require('../../database/db.js');

/**
 * Route handler for cancelling a user's subscription
 * Sets premium_status to false in the database
 */
router.post('/cancel-subscription', async (req, res) => {
    try {
       
        
        // Get user ID from the request (set by VerifyToken middleware)
        const userId = req.user.id;

       
        
        if (!userId) {
            console.error('No user ID found in request. VerifyToken middleware may not be working correctly.');
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        // Update user record to set premium_status to false
        const updateQuery = `
            UPDATE users
            SET premium_status = false
            WHERE id = $1
            RETURNING *
        `;
        
       
        const result = await pool.query(updateQuery, [userId]);
        
        // Check if any rows were affected (if the user exists)
        if (result.rowCount === 0) {
            console.error('No rows updated. User might not exist with ID:', userId);
            return res.status(404).json({ error: 'User not found' });
        }
        
       
        
        if (result.rows.length > 0) {
           
            res.status(200).json({ 
                message: 'Subscription cancelled successfully',
                // You might want to return updated user info
                user: {
                    id: result.rows[0].id,
                    premium_status: result.rows[0].premium_status
                }
            });
        } else {
            console.error('No user found with ID:', userId);
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error cancelling subscription:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;