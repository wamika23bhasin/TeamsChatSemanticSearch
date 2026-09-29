const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    // Fetch all threads, ordered chronologically by the timestamp of their creation/update
    const sql = `
      SELECT 
        id,
        channel_name,
        question,
        resolution,
        source_url,
        source_updated_at,
        messages
      FROM teams_threads
      ORDER BY source_updated_at ASC;
    `;
    
    const result = await db.query(sql);

    return res.json({
      threads: result.rows
    });
  } catch (error) {
    console.error('Threads fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
