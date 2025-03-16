const express = require('express');
const router = express.Router();
// This ../../ moves up two directories (from test-connection/ → routes/ → backend/)
const pool = require('../../database/db.js');

//This is to test is the  postgreSQL database is running and connected to our server
router.get('/test-db', async (req, res) => {
   
    try {
        const result = await pool.query('SELECT NOW()');
       
        res.json({ message: 'Database is working!', timestamp: result.rows[0].now });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({ error: 'Could not connect to database', details: error.message });
    }
});

module.exports = router;