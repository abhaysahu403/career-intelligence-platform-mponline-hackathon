CREATE TABLE IF NOT EXISTS chat_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    session_type    VARCHAR(20) NOT NULL,
    started_at      TIMESTAMP NOT NULL DEFAULT now(),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    context_json    TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

CREATE TABLE IF NOT EXISTS chat_messages (
    id                BIGSERIAL PRIMARY KEY,
    session_id        BIGINT NOT NULL REFERENCES chat_sessions(id),
    role              VARCHAR(20) NOT NULL,
    content           TEXT NOT NULL,
    message_type      VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    metadata_json     TEXT,
    rating            INTEGER,
    feedback_type     VARCHAR(30),
    feedback_comment  TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
