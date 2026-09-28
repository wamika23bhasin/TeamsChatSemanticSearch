const db = require("../db");

const MAX_CHUNK_CHARS = 3000;

/**
 * Breaks an unusually long reply into smaller sections.
 */
function splitLongText(text, maximumLength) {
  const sections = [];

  for (let start = 0; start < text.length; start += maximumLength) {
    sections.push(text.slice(start, start + maximumLength));
  }

  return sections;
}

/**
 * Converts messages into formatted reply blocks.
 *
 * A long reply may become multiple blocks so that it does not
 * create a chunk larger than MAX_CHUNK_CHARS.
 */
function buildReplyBlocks(messages, availableCharacters) {
  const blocks = [];

  for (const message of messages) {
    const author = message.author?.trim() || "Unknown";
    const text = message.text?.trim();

    if (!text) {
      continue;
    }

    const prefix = `- ${author}: `;
    const maximumTextLength = Math.max(
      availableCharacters - prefix.length,
      500
    );

    const textSections = splitLongText(text, maximumTextLength);

    textSections.forEach((section, index) => {
      const continuation =
        index === 0 ? prefix : `- ${author} (continued): `;

      blocks.push(`${continuation}${section}`);
    });
  }

  return blocks;
}

/**
 * Creates one or more chunks for a Teams thread.
 */
function createThreadChunks(thread) {
  let messages = thread.messages ?? [];

  // This is helpful if JSON was returned as a string for some reason.
  if (typeof messages === "string") {
    try {
      messages = JSON.parse(messages);
    } catch {
      messages = [];
    }
  }

  if (!Array.isArray(messages)) {
    messages = [];
  }

  const channelName = thread.channel_name?.trim() || "Unknown";
  const question = thread.question?.trim() || "No question provided";
  const resolution = thread.resolution?.trim();

  const header = [
    `Channel: ${channelName}`,
    `Question: ${question}`,
    "",
    "Replies:"
  ].join("\n");

  /*
   * Keep the resolution in every chunk so that each chunk has the
   * complete question/answer context during similarity search.
   */
  const footer = resolution
    ? `\n\nResolution: ${resolution}`
    : "";

  /*
   * Reserve space for the header, resolution and part label.
   */
  const metadataLength =
    header.length +
    footer.length +
    50;

  const availableCharacters = Math.max(
    MAX_CHUNK_CHARS - metadataLength,
    500
  );

  const replyBlocks = buildReplyBlocks(
    messages,
    availableCharacters
  );

  /*
   * Handle a thread that has no replies.
   */
  if (replyBlocks.length === 0) {
    return [`${header}\nNo replies available.${footer}`];
  }

  const groupedReplies = [];
  let currentReplies = [];
  let currentLength = metadataLength;

  for (const replyBlock of replyBlocks) {
    const replyLength = replyBlock.length + 1;

    const exceedsLimit =
      currentReplies.length > 0 &&
      currentLength + replyLength > MAX_CHUNK_CHARS;

    if (exceedsLimit) {
      groupedReplies.push(currentReplies);

      /*
       * Preserve the last reply from the previous chunk as context.
       */
      const overlappingReply =
        currentReplies[currentReplies.length - 1];

      currentReplies = [overlappingReply];
      currentLength =
        metadataLength +
        overlappingReply.length +
        1;
    }

    /*
     * Avoid adding the same reply twice when it is already present
     * because of overlap.
     */
    if (
      currentReplies[currentReplies.length - 1] !== replyBlock
    ) {
      currentReplies.push(replyBlock);
      currentLength += replyLength;
    }
  }

  if (currentReplies.length > 0) {
    groupedReplies.push(currentReplies);
  }

  const totalParts = groupedReplies.length;

  return groupedReplies.map((replies, index) => {
    const part = `Part: ${index + 1} of ${totalParts}`;

    return [
      `Channel: ${channelName}`,
      `Question: ${question}`,
      part,
      "",
      "Replies:",
      ...replies,
      ...(resolution
        ? ["", `Resolution: ${resolution}`]
        : [])
    ].join("\n");
  });
}

async function chunkThreads() {
  console.log("Fetching threads from database...");

  const result = await db.query(`
    SELECT
      id,
      question,
      channel_name,
      messages,
      resolution
    FROM teams_threads
    ORDER BY imported_at, id
  `);

  const threads = result.rows;

  console.log(
    `Found ${threads.length} threads. Generating chunks...`
  );

  let totalChunks = 0;
  let failedThreads = 0;

  for (const thread of threads) {
    const client = await db.connect();

    try {
      const chunks = createThreadChunks(thread);

      await client.query("BEGIN");

      /*
       * Delete all existing chunks for this thread.
       *
       * This is necessary because a thread that previously had three
       * chunks might have only two chunks after being edited.
       */
      await client.query(
        `
          DELETE FROM teams_thread_chunks
          WHERE thread_id = $1
        `,
        [thread.id]
      );

      for (let index = 0; index < chunks.length; index++) {
        await client.query(
          `
            INSERT INTO teams_thread_chunks (
              thread_id,
              chunk_index,
              content,
              embedding,
              embedding_model
            )
            VALUES ($1, $2, $3, NULL, NULL)
          `,
          [thread.id, index, chunks[index]]
        );
      }

      await client.query("COMMIT");

      totalChunks += chunks.length;

      console.log(
        `Thread ${thread.id}: created ${chunks.length} chunk(s)`
      );
    } catch (error) {
      await client.query("ROLLBACK");

      failedThreads++;

      console.error(
        `Failed to chunk thread ${thread.id}:`,
        error.message
      );
    } finally {
      client.release();
    }
  }

  console.log("");
  console.log("Chunking completed.");
  console.log(`Threads processed: ${threads.length}`);
  console.log(`Chunks generated: ${totalChunks}`);
  console.log(`Failed threads: ${failedThreads}`);

  if (failedThreads > 0) {
    process.exitCode = 1;
  }
}

chunkThreads()
  .catch(error => {
    console.error("Error chunking threads:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });