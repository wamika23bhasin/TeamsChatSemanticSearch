const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Example database route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Search route
const searchRouter = require('./src/search');
app.use('/api/v1/knowledge/search', searchRouter);

// Threads route
const threadsRouter = require('./src/threads');
app.use('/api/v1/knowledge/threads', threadsRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
