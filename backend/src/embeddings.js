const db = require('../db');

async function generateEmbeddings() {
  const model = 'mxbai-embed-large';
  const ollamaUrl = process.env.OLLAMA_HOST || 'http://localhost:11435';
  
  try {
    console.log(`Using Ollama at ${ollamaUrl} and model ${model}`);
    
    // First, make sure the model is pulled
    console.log('Ensuring model is available...');
    const pullRes = await fetch(`${ollamaUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model })
    });
    
    // Read the stream to wait for pull completion
    if (!pullRes.ok) {
      throw new Error(`Failed to pull model: ${pullRes.statusText}`);
    }
    const pullText = await pullRes.text();
    console.log('Model pulled or already exists.');

    console.log('Fetching chunks without embeddings...');
    const result = await db.query('SELECT id, content FROM teams_thread_chunks WHERE embedding IS NULL');
    const chunks = result.rows;
    
    if (chunks.length === 0) {
      console.log('No chunks need embeddings. Exiting.');
      process.exit(0);
    }
    
    console.log(`Found ${chunks.length} chunks. Generating embeddings...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
      
      const response = await fetch(`${ollamaUrl}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          input: chunk.content,
          truncate: true
        })
      });
      
      if (!response.ok) {
        console.error(`Ollama error for chunk ${chunk.id}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.embeddings && data.embeddings.length > 0) {
        const embeddingString = `[${data.embeddings[0].join(',')}]`;
        
        await db.query(
          'UPDATE teams_thread_chunks SET embedding = $1, embedding_model = $2 WHERE id = $3',
          [embeddingString, model, chunk.id]
        );
      } else {
        console.error(`Failed to generate embedding for chunk ${chunk.id}`);
      }
    }
    
    console.log('Successfully generated all embeddings!');
    process.exit(0);
  } catch (err) {
    console.error('Error generating embeddings:', err);
    process.exit(1);
  }
}

generateEmbeddings();
