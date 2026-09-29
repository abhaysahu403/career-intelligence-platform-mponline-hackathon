-- Baseline: matches the table Hibernate ddl-auto=update already created in existing environments.
-- Flyway baseline-on-migrate=true means this file won't actually run there; it only runs
-- CREATE TABLE on a genuinely fresh database (e.g. a new docker volume).
CREATE TABLE IF NOT EXISTS interviews (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    type                VARCHAR(20) NOT NULL DEFAULT 'TECHNICAL',
    status              VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    job_role            VARCHAR(255),
    questions           JSONB,
    answers             JSONB,
    total_score         DOUBLE PRECISION,
    total_questions     INTEGER,
    answered_questions  INTEGER,
    feedback            JSONB,
    started_at          TIMESTAMP NOT NULL DEFAULT now(),
    completed_at        TIMESTAMP,
    updated_at          TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
