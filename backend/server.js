require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createTables } = require('./models/schema');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Use API routes
app.use('/api', apiRoutes);

// Create tables if they don't exist
createTables();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});