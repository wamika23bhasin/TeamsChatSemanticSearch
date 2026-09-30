const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateAnswer } = require('./generateAnswer');

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const model = 'mxbai-embed-large';
    const ollamaUrl = process.env.OLLAMA_HOST || 'http://localhost:11435';

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

    const minSimilarity = 0.50; // Threshold
    const sql = `
      WITH ranked_chunks AS (
          SELECT
              t.id,
              t.external_thread_id,
              t.question,
              t.resolution,
              t.source_url,
              t.source_updated_at,
              t.messages,
              c.content,
              c.chunk_index,
              1 - (c.embedding <=> $1::vector) AS similarity,
              ROW_NUMBER() OVER (
                  PARTITION BY t.id
                  ORDER BY c.embedding <=> $1::vector
              ) AS chunk_rank
          FROM teams_thread_chunks c
          JOIN teams_threads t
            ON t.id = c.thread_id
          WHERE c.embedding IS NOT NULL
      )
      SELECT *
      FROM ranked_chunks
      WHERE chunk_rank = 1
        AND similarity >= $2
      ORDER BY similarity DESC
      LIMIT 3;
    `;

    const result = await db.query(sql, [queryEmbedding, minSimilarity]);
    const topThreads = result.rows;

    // Temporary debugging log
    console.table(
      topThreads.map(thread => ({
        thread: thread.external_thread_id,
        similarity: Number(thread.similarity).toFixed(4)
      }))
    );

    if (topThreads.length === 0) {
      return res.json({
        answer: "I could not find enough information in previous conversations to answer your question.",
        sources: [],
        results: []
      });
    }

    console.log(
      "Retrieved threads for augmentation:",
      topThreads.map(thread => ({
        externalThreadId: thread.external_thread_id,
        question: thread.question,
        chunkIndex: thread.chunk_index,
        similarity: thread.similarity,
        hasContent: Boolean(thread.content),
        contentLength: thread.content?.length
      }))
    );

    const generatedAnswer = await generateAnswer(query, topThreads);

    return res.json({
      answer: generatedAnswer,
      sources: topThreads,
      results: topThreads
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
