CREATE TABLE career_targets (
    id                  BIGSERIAL PRIMARY KEY,
    target_code         VARCHAR(30) NOT NULL UNIQUE, -- e.g. GOOGLE_SWE
    name                VARCHAR(255) NOT NULL,
    target_type         VARCHAR(30) NOT NULL, -- PRIVATE_TECH, GOVERNMENT, PSU, BANKING, DEFENCE, HIGHER_STUDIES, ENTREPRENEURSHIP
    min_cgpa            DOUBLE PRECISION,
    required_skills     TEXT[] NOT NULL,
    preferred_skills    TEXT[],
    interview_rounds    INTEGER,
    avg_package_lpa     DOUBLE PRECISION, -- illustrative estimate, not a verified/scraped figure
    hiring_months       TEXT[], -- illustrative typical hiring window
    readiness_required  INTEGER NOT NULL,
    preparation_weeks   INTEGER NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_career_targets_type ON career_targets(target_type);

CREATE TABLE user_target_milestones (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    target_code   VARCHAR(30) NOT NULL,
    milestone_index INTEGER NOT NULL,
    completed     BOOLEAN NOT NULL DEFAULT false,
    completed_at  TIMESTAMP,
    UNIQUE (user_id, target_code, milestone_index)
);

CREATE INDEX idx_user_target_milestones_user ON user_target_milestones(user_id, target_code);
