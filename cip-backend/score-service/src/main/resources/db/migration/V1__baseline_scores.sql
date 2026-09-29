-- Baseline: matches the table Hibernate ddl-auto=update already created in existing environments.
CREATE TABLE IF NOT EXISTS scores (
    user_id           BIGINT PRIMARY KEY, -- same id as users table in auth-service
    resume_score      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    academic_score    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    interview_score   DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    readiness         DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    level             VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    recommendation    VARCHAR(255),
    calculated_at     TIMESTAMP
);
