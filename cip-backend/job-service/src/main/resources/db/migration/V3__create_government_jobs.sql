CREATE TABLE government_jobs (
    id                 BIGSERIAL PRIMARY KEY,
    code               VARCHAR(20) NOT NULL UNIQUE, -- e.g. GOV001
    title              VARCHAR(255) NOT NULL,
    organization       VARCHAR(255) NOT NULL,
    category           VARCHAR(50) NOT NULL, -- CENTRAL_GOVT, STATE_GOVT, PSU, BANKING, RAILWAY, DEFENCE
    eligible_branches  TEXT[] NOT NULL,       -- e.g. {CSE,IT,ECE} or {ALL}
    min_cgpa           NUMERIC(3,1),
    exam_name          VARCHAR(255),
    application_link   VARCHAR(500) NOT NULL,
    exam_cycle         VARCHAR(255), -- descriptive, e.g. "Notification: Feb-Mar, Prelims: Jun" (real dates vary yearly, not asserted as exact)
    salary             VARCHAR(100),
    eligibility        TEXT,
    tags               TEXT[],
    active             BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_government_jobs_category ON government_jobs(category);
CREATE INDEX idx_government_jobs_active ON government_jobs(active);
