-- Adds the fields the frontend's "V3 Interview System" needs on top of the original
-- simple interview record, plus a table for periodic facial/voice analytics samples.
ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS interview_mode VARCHAR(30),
    ADD COLUMN IF NOT EXISTS company        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS branch         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS duration       INTEGER,
    ADD COLUMN IF NOT EXISTS difficulty     VARCHAR(20),
    ADD COLUMN IF NOT EXISTS persona        VARCHAR(30),
    ADD COLUMN IF NOT EXISTS round_type     VARCHAR(20);

CREATE TABLE IF NOT EXISTS facial_analytics (
    id                BIGSERIAL PRIMARY KEY,
    interview_id      BIGINT NOT NULL,
    confidence_score  DOUBLE PRECISION,
    eye_contact       VARCHAR(20),
    emotion           VARCHAR(50),
    posture           VARCHAR(20),
    voice_clarity     DOUBLE PRECISION,
    recorded_at       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_facial_analytics_interview_id ON facial_analytics(interview_id);
