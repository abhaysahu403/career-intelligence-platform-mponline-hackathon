-- Baseline: matches the table Hibernate ddl-auto=update already created in existing environments.
CREATE TABLE IF NOT EXISTS jobs (
    id                        BIGSERIAL PRIMARY KEY,
    company                   VARCHAR(255) NOT NULL,
    role                      VARCHAR(255) NOT NULL,
    description               TEXT,
    location                  VARCHAR(255),
    employment_type           VARCHAR(50),
    experience_level          VARCHAR(50),
    salary_range              VARCHAR(255),
    source_url                VARCHAR(255),
    minimum_readiness_score   DOUBLE PRECISION NOT NULL,
    required_skills           JSONB,
    nice_to_have_skills       JSONB,
    application_deadline      DATE,
    active                    BOOLEAN NOT NULL DEFAULT true,
    created_at                TIMESTAMP,
    updated_at                TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(active);
