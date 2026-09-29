const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const model = 'mxbai-embed-large';
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11435';

    // 1. Generate an embedding for the incoming query
    const response = await fetch(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: query })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate query embedding: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.embedding) {
      throw new Error('No embedding returned from Ollama');
    }
    
    const queryEmbedding = `[${data.embedding.join(',')}]`;

    // 2 & 3. Compare with stored chunks, group by thread, and get the max similarity
    // The `<=>` operator computes cosine distance, so `1 - distance` gives cosine similarity.
    const sql = `
      WITH chunk_scores AS (
        SELECT 
          thread_id,
          (1 - (embedding <=> $1::vector)) AS similarity
        FROM teams_thread_chunks
        WHERE embedding IS NOT NULL
      ),
      thread_max_scores AS (
        SELECT 
          thread_id,
          MAX(similarity) AS max_similarity
        FROM chunk_scores
        GROUP BY thread_id
      )
      -- 4 & 5. Include similarity, question, resolution, and source URL, limit to top 3
      SELECT 
        t.id,
        t.question,
        t.resolution,
        t.source_url,
        t.source_updated_at,
        t.messages,
        ms.max_similarity AS similarity
      FROM thread_max_scores ms
      JOIN teams_threads t ON t.id = ms.thread_id
      WHERE ms.max_similarity >= 0.65
      ORDER BY ms.max_similarity DESC
      LIMIT 3;
    `;

    const result = await db.query(sql, [queryEmbedding]);

    return res.json({
      results: result.rows
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
