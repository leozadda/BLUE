const express = require('express');
const router = express.Router();
const pool = require('../../../database/db.js');
const { upload, uploadToS3 } = require('./SendMediaToS3.js');
const fs = require('fs');

router.post('/save-user-measurement', upload.single('media'), async (req, res) => {
 
 
 
 
  
  try {
      const userId = req.user?.id;
     

     
     
     

// In SaveUserMeasurement.js
const measurementData = req.body;

     
      const requiredFields = ['bodyWeight', 'arms', 'thighs', 'calves', 'waist', 'forearms', 'chest'];
      const hasMeasurements = requiredFields.some(field => measurementData[field] != null);
     


      if (!hasMeasurements) {
         
          return res.status(400).json({ 
              error: 'Please provide at least one measurement' 
          });
      }

      const client = await pool.connect();
     
     

      try {
          await client.query('BEGIN');
         

         
          const insertValues = [
              userId,
              measurementData.date || new Date(),
              measurementData.bodyWeight || null,
              measurementData.arms || null,
              measurementData.thighs || null,
              measurementData.calves || null,
              measurementData.waist || null,
              measurementData.forearms || null,
              measurementData.chest || null
          ];
         

          const measurementResult = await client.query(
              `INSERT INTO measurement 
              (user_id, date, body_weight, arms, thighs, calves, waist, forearms, chest)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING id`,
              insertValues
          );
         

          let mediaUrl = null;
          if (req.file) {
             
             
              mediaUrl = await uploadToS3(req.file, userId);
             

              await client.query(
                  `INSERT INTO progress_media 
                  (measurement_id, media_type, media_url)
                  VALUES ($1, $2, $3)`,
                  [
                      measurementResult.rows[0].id,
                      req.file.mimetype.startsWith('image/') ? 'photo' : 'video',
                      mediaUrl
                  ]
              );
          }

          await client.query('COMMIT');
         
          
          if (req.file) {
              fs.unlinkSync(req.file.path);
             
          }

          const responseData = {
              success: true,
              measurementId: measurementResult.rows[0].id,
              mediaUrl,
              savedMeasurements: Object.entries(measurementData)
                  .filter(([key, value]) => value != null && key !== 'date')
                  .map(([key]) => key)
          };
         
         
          
          res.json(responseData);

      } catch (err) {
          console.error('\n--- DATABASE ERROR ---');
          console.error('Error during transaction:', err);
          await client.query('ROLLBACK');
         
          throw err;
      } finally {
          client.release();
         
      }

  } catch (err) {
      console.error('\n--- TOP-LEVEL ERROR ---');
      console.error('Error stack:', err.stack);
      console.error('Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      
      if (req.file) {
          fs.unlinkSync(req.file.path);
         
      }
      
      res.status(500).json({ error: 'Sorry, we couldn\'t save your measurements' });
  } finally {
     
  }
});

module.exports = router;