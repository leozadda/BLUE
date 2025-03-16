const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');

/**
 * Gets all available set templates
 * GET /get-all-set-templates
 * 
 * No request body needed
 */
router.get('/get-all-set-templates', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                set_type_templates.id, 
                set_types.name AS set_type_name, 
                set_type_templates.phase_number, 
                set_type_templates.rep_range_min, 
                set_type_templates.rep_range_max, 
                set_type_templates.weight_modifier, 
                set_type_templates.target_rest_period_seconds
             FROM set_type_templates
             INNER JOIN set_types
                ON set_type_templates.set_type_id = set_types.id`
        );

        res.json({ success: true, templates: result.rows });
    } catch (error) {
        console.error('Error getting set templates:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;