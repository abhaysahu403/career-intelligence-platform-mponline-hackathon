-- Baseline: matches the table Hibernate ddl-auto=update already created in existing environments.
CREATE TABLE IF NOT EXISTS resumes (
    id                 VARCHAR(36) PRIMARY KEY, -- Hibernate GenerationType.UUID
    user_id            BIGINT NOT NULL,
    file_name          VARCHAR(255) NOT NULL,
    file_url           VARCHAR(255) NOT NULL,
    file_size_bytes    BIGINT,
    content_type       VARCHAR(255),
    parse_status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    parsed_data        TEXT,
    resume_score       DOUBLE PRECISION,
    uploaded_at        TIMESTAMP,
    updated_at         TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
