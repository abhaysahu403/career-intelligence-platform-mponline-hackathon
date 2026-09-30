CREATE TABLE courses (
    id                    BIGSERIAL PRIMARY KEY,
    code                  VARCHAR(20) NOT NULL UNIQUE, -- e.g. CRS001
    title                 VARCHAR(255) NOT NULL,
    platform              VARCHAR(100) NOT NULL, -- NPTEL, SWAYAM, Coursera, edX, freeCodeCamp, ...
    platform_type         VARCHAR(20) NOT NULL CHECK (platform_type IN ('GOVERNMENT', 'INTERNATIONAL', 'INDIAN', 'PAID')),
    url                   VARCHAR(500) NOT NULL,
    skills_covered        TEXT[] NOT NULL,
    branches              TEXT[] NOT NULL, -- ALL or specific branches
    duration_weeks        INTEGER,
    cost                  VARCHAR(50) NOT NULL, -- e.g. "Free", "Free audit", "₹499"
    certification         BOOLEAN NOT NULL DEFAULT false,
    certification_body    VARCHAR(255),
    difficulty            VARCHAR(20) NOT NULL CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    rating                NUMERIC(2,1),
    government_recognized BOOLEAN NOT NULL DEFAULT false,
    tags                  TEXT[],
    active                BOOLEAN NOT NULL DEFAULT true,
    created_at            TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_platform_type ON courses(platform_type);
CREATE INDEX idx_courses_government_recognized ON courses(government_recognized);
CREATE INDEX idx_courses_active ON courses(active);

CREATE TABLE user_course_progress (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    course_id    BIGINT NOT NULL REFERENCES courses(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'SAVED' CHECK (status IN ('SAVED', 'IN_PROGRESS', 'COMPLETED')),
    saved_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP,
    UNIQUE (user_id, course_id)
);

CREATE INDEX idx_user_course_progress_user_id ON user_course_progress(user_id);
