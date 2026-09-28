CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS teams_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_thread_id TEXT UNIQUE NOT NULL,
    channel_name TEXT,
    question TEXT NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    resolution TEXT,
    source_url TEXT,
    source_updated_at TIMESTAMPTZ,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (jsonb_typeof(messages) = 'array')
);

CREATE TABLE IF NOT EXISTS teams_thread_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL
        REFERENCES teams_threads(id)
        ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1024),
    embedding_model TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (thread_id, chunk_index)
);