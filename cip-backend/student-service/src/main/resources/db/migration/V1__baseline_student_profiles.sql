-- Baseline: matches the table Hibernate ddl-auto=update already created in existing environments.
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id           BIGINT PRIMARY KEY, -- same id as users table in auth-service
    name              VARCHAR(255) NOT NULL,
    email             VARCHAR(255) NOT NULL UNIQUE,
    phone             VARCHAR(255),
    institution       VARCHAR(255),
    department        VARCHAR(255),
    graduation_year   INTEGER,
    linkedin_url      VARCHAR(255),
    github_url        VARCHAR(255),
    skills            TEXT,
    academic_data     TEXT,
    work_experience   TEXT,
    certifications    TEXT,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);
