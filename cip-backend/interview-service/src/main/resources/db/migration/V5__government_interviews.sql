ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS government_exam_type VARCHAR(30); -- SSB, UPSC, BANK_PO, SSC_RAILWAY, RESEARCH_ORG

CREATE TABLE government_interview_questions (
    id            BIGSERIAL PRIMARY KEY,
    exam_type     VARCHAR(30) NOT NULL, -- SSB, UPSC, BANK_PO, SSC_RAILWAY, RESEARCH_ORG
    category      VARCHAR(100) NOT NULL, -- e.g. Leadership, Current Affairs, Banking Awareness
    difficulty    VARCHAR(10) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    question      TEXT NOT NULL,
    ideal_answer  TEXT,
    tags          TEXT[],
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_gov_interview_questions_exam_type ON government_interview_questions(exam_type);
CREATE INDEX idx_gov_interview_questions_difficulty ON government_interview_questions(difficulty);
