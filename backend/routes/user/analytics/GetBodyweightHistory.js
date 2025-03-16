const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

// This route gets the user's body weight history for multiple time ranges in a single call
router.get('/get-bodyweight-history', async (req, res) => {
    try {
        // Get the user's ID from their login token
        const userId = req.user.id;
        
       
        
        // Get current date for calculations
        const currentDate = new Date();
        
        // Calculate date ranges for all three periods
        // 1. Last 7 days (today + 6 days prior)
        const weekStartDate = new Date(currentDate);
        weekStartDate.setDate(currentDate.getDate() - 6);
        
        // 2. Last 4 weeks
        const monthStartDate = new Date(currentDate);
        monthStartDate.setDate(currentDate.getDate() - 28);
        
        // 3. Last 12 months
        const yearStartDate = new Date(currentDate);
        yearStartDate.setMonth(currentDate.getMonth() - 11);
        yearStartDate.setDate(1); // First day of the month
        
        // Format dates for SQL query
        const formattedWeekStartDate = weekStartDate.toISOString();
        const formattedMonthStartDate = monthStartDate.toISOString();
        const formattedYearStartDate = yearStartDate.toISOString();
        
        // Query for daily data (last 7 days)
        const dailyQuery = `
            SELECT 
                DATE(created_at) as date,
                ROUND(AVG(body_weight)::numeric, 1) as weight
            FROM measurement
            WHERE user_id = $1 
            AND created_at >= $2
            AND body_weight IS NOT NULL
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        
        // Query for weekly data (last 4 weeks)
        const weeklyQuery = `
            SELECT 
                DATE_TRUNC('week', created_at) as week_start,
                ROUND(AVG(body_weight)::numeric, 1) as weight
            FROM measurement
            WHERE user_id = $1 
            AND created_at >= $2
            AND body_weight IS NOT NULL
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY week_start ASC
        `;
        
        // Query for monthly data (last 12 months)
        const monthlyQuery = `
            SELECT 
                DATE_TRUNC('month', created_at) as month_start,
                ROUND(AVG(body_weight)::numeric, 1) as weight
            FROM measurement
            WHERE user_id = $1 
            AND created_at >= $2
            AND body_weight IS NOT NULL
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month_start ASC
        `;
        
        // Execute all queries in parallel for efficiency
        const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
            pool.query(dailyQuery, [userId, formattedWeekStartDate]),
            pool.query(weeklyQuery, [userId, formattedMonthStartDate]),
            pool.query(monthlyQuery, [userId, formattedYearStartDate])
        ]);
        
        
        // Format daily data (last 7 days)
        const dailyData = [];
        // Create a map of the dates we have data for
        const existingDatesMap = new Map();
        dailyResult.rows.forEach(row => {
            const dateStr = row.date.toISOString().split('T')[0];
            existingDatesMap.set(dateStr, parseFloat(row.weight));
        });
        
        // Generate array with all 7 days, including only days with data
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - (6 - i)); // Start from 6 days ago
            const dateStr = date.toISOString().split('T')[0];
            
            if (existingDatesMap.has(dateStr)) {
                dailyData.push({
                    date: dateStr,
                    weight: existingDatesMap.get(dateStr)
                });
            }
        }
        
        // Format weekly data (last 4 weeks)
        const weeklyData = weeklyResult.rows.map(row => ({
            date: row.week_start.toISOString().split('T')[0], // Format as YYYY-MM-DD
            weight: parseFloat(row.weight)
        }));
        
        // Format monthly data (last 12 months)
        const monthlyData = monthlyResult.rows.map(row => ({
            date: row.month_start.toISOString().split('T')[0], // Format as YYYY-MM-DD
            weight: parseFloat(row.weight)
        }));
        
        // Create the response object with all three data sets
        const response = {
            week: dailyData,
            month: weeklyData,
            year: monthlyData
        };
        
       
        res.json(response);
        
    } catch (err) {
        console.error('Error fetching body weight history:', err);
        res.status(500).json({ error: 'Failed to fetch body weight history' });
    }
});

module.exports = router;