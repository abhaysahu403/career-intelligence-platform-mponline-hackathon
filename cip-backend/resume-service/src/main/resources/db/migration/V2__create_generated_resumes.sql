CREATE TABLE generated_resumes (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL UNIQUE,
    template_id   VARCHAR(30) NOT NULL, -- CLEAN_PROFESSIONAL, MODERN_TECH, EXECUTIVE
    content_json  TEXT NOT NULL, -- assembled resume sections
    ats_score     INTEGER NOT NULL,
    ats_feedback  TEXT NOT NULL, -- JSON array of ATS check results
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP
);
