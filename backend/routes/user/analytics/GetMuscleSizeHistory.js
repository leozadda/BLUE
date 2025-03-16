const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

// This route gets the user's muscle size history for multiple time ranges in a single call
router.get('/muscle-size-history', async (req, res) => {
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
                ROUND(AVG(arms)::numeric, 1) as arms,
                ROUND(AVG(thighs)::numeric, 1) as thighs,
                ROUND(AVG(calves)::numeric, 1) as calves,
                ROUND(AVG(waist)::numeric, 1) as waist,
                ROUND(AVG(forearms)::numeric, 1) as forearms,
                ROUND(AVG(chest)::numeric, 1) as chest
            FROM measurement
            WHERE user_id = $1 
            AND created_at >= $2
            AND (arms IS NOT NULL OR thighs IS NOT NULL OR calves IS NOT NULL 
                OR waist IS NOT NULL OR forearms IS NOT NULL OR chest IS NOT NULL)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        
        // Query for weekly data (last 4 weeks)
        // Note: We're using DATE_TRUNC('week', created_at) to get weekly averages
        const weeklyQuery = `
            SELECT 
                DATE_TRUNC('week', created_at) as date,
                ROUND(AVG(arms)::numeric, 1) as arms,
                ROUND(AVG(thighs)::numeric, 1) as thighs,
                ROUND(AVG(calves)::numeric, 1) as calves,
                ROUND(AVG(waist)::numeric, 1) as waist,
                ROUND(AVG(forearms)::numeric, 1) as forearms,
                ROUND(AVG(chest)::numeric, 1) as chest
            FROM measurement
            WHERE user_id = $1 
            AND created_at >= $2
            AND (arms IS NOT NULL OR thighs IS NOT NULL OR calves IS NOT NULL 
                OR waist IS NOT NULL OR forearms IS NOT NULL OR chest IS NOT NULL)
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY date ASC
        `;
        
        // Query for monthly data (last 12 months)
        const monthlyQuery = `
            SELECT 
                DATE_TRUNC('month', created_at) as date,
                ROUND(AVG(arms)::numeric, 1) as arms,
                ROUND(AVG(thighs)::numeric, 1) as thighs,
                ROUND(AVG(calves)::numeric, 1) as calves,
                ROUND(AVG(waist)::numeric, 1) as waist,
                ROUND(AVG(forearms)::numeric, 1) as forearms,
                ROUND(AVG(chest)::numeric, 1) as chest
            FROM measurement
            WHERE user_id = $1 
            AND created_at >= $2
            AND (arms IS NOT NULL OR thighs IS NOT NULL OR calves IS NOT NULL 
                OR waist IS NOT NULL OR forearms IS NOT NULL OR chest IS NOT NULL)
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY date ASC
        `;
        
        // Execute all queries in parallel for efficiency
        const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
            pool.query(dailyQuery, [userId, formattedWeekStartDate]),
            pool.query(weeklyQuery, [userId, formattedMonthStartDate]),
            pool.query(monthlyQuery, [userId, formattedYearStartDate])
        ]);
        
        // Format daily data (last 7 days)
        const dailyData = dailyResult.rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            arms: parseFloat(row.arms || 0),
            thighs: parseFloat(row.thighs || 0),
            calves: parseFloat(row.calves || 0),
            waist: parseFloat(row.waist || 0),
            forearms: parseFloat(row.forearms || 0),
            chest: parseFloat(row.chest || 0)
        }));
        
        // Format weekly data (last 4 weeks)
        const weeklyData = weeklyResult.rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            arms: parseFloat(row.arms || 0),
            thighs: parseFloat(row.thighs || 0),
            calves: parseFloat(row.calves || 0),
            waist: parseFloat(row.waist || 0),
            forearms: parseFloat(row.forearms || 0),
            chest: parseFloat(row.chest || 0)
        }));
        
        // Format monthly data (last 12 months)
        const monthlyData = monthlyResult.rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            arms: parseFloat(row.arms || 0),
            thighs: parseFloat(row.thighs || 0),
            calves: parseFloat(row.calves || 0),
            waist: parseFloat(row.waist || 0),
            forearms: parseFloat(row.forearms || 0),
            chest: parseFloat(row.chest || 0)
        }));
        
        // Create the response object with all three data sets - we're NOT filtering out any data
        // that came back from the database. If a record exists, we include it.
        const response = {
            week: dailyData,
            month: weeklyData,
            year: monthlyData
        };
        
       
        res.json(response);
        
    } catch (err) {
        console.error('Error fetching muscle size history:', err);
        res.status(500).json({ 
            error: 'Failed to fetch muscle size history',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;