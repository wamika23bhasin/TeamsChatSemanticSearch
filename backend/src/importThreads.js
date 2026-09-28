const fs = require('fs');
const path = require('path');
const db = require('../db');

async function importThreads() {
  try {
    const filePath = path.join(__dirname, 'data', 'teamsThreads.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Starting import of ${data.length} threads...`);

    for (const thread of data) {
      const {
        externalThreadId,
        channelName,
        question,
        replies,
        resolution,
        sourceUrl,
        sourceUpdatedAt
      } = thread;

      // Upsert into teams_threads to avoid duplicates if run multiple times
      const query = `
        INSERT INTO teams_threads (
          external_thread_id,
          channel_name,
          question,
          messages,
          resolution,
          source_url,
          source_updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (external_thread_id) DO UPDATE SET
          channel_name = EXCLUDED.channel_name,
          question = EXCLUDED.question,
          messages = EXCLUDED.messages,
          resolution = EXCLUDED.resolution,
          source_url = EXCLUDED.source_url,
          source_updated_at = EXCLUDED.source_updated_at
        RETURNING id;
      `;

      const values = [
        externalThreadId,
        channelName,
        question,
        JSON.stringify(replies || []),
        resolution,
        sourceUrl,
        sourceUpdatedAt
      ];

      await db.query(query, values);
    }

    console.log(`Successfully imported ${data.length} threads into the database!`);
    process.exit(0);
  } catch (err) {
    console.error('Error importing threads:', err);
    process.exit(1);
  }
}

importThreads();
