CREATE TABLE student_academic_profiles (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE,
    college_name        VARCHAR(200),
    branch              VARCHAR(50),
    year_of_study       INTEGER,
    graduation_year     INTEGER,
    current_cgpa        DOUBLE PRECISION,
    tenth_percentage    DOUBLE PRECISION,
    tenth_board         VARCHAR(50),
    twelfth_percentage  DOUBLE PRECISION,
    twelfth_stream      VARCHAR(50),
    active_backlogs     INTEGER NOT NULL DEFAULT 0,
    gap_year            BOOLEAN NOT NULL DEFAULT false,
    internships_count   INTEGER NOT NULL DEFAULT 0,
    hackathon_wins      INTEGER NOT NULL DEFAULT 0,
    target_role_type    VARCHAR(50), -- PRIVATE_TECH, GOVERNMENT, PSU, BANKING, DEFENCE, RESEARCH, ENTREPRENEURSHIP
    willing_to_relocate BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP
);

CREATE INDEX idx_academic_profiles_branch ON student_academic_profiles(branch);
