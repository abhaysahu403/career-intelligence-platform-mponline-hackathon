-- Static question bank: pre-saved questions for practice mode (as opposed to the
-- resume/Gemini-generated questions stored per-interview in interviews.questions).
CREATE TABLE company_questions (
    id            BIGSERIAL PRIMARY KEY,
    company_name  VARCHAR(100) NOT NULL,
    role          VARCHAR(100) NOT NULL,
    category      VARCHAR(50)  NOT NULL,
    difficulty    VARCHAR(10)  NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    question      TEXT NOT NULL,
    ideal_answer  TEXT,
    tags          TEXT[],
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_company_questions_company ON company_questions(company_name);
CREATE INDEX idx_company_questions_difficulty ON company_questions(difficulty);

CREATE TABLE branch_questions (
    id            BIGSERIAL PRIMARY KEY,
    branch        VARCHAR(100) NOT NULL,
    subject       VARCHAR(100) NOT NULL,
    difficulty    VARCHAR(10)  NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    question      TEXT NOT NULL,
    ideal_answer  TEXT,
    tags          TEXT[],
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_branch_questions_branch ON branch_questions(branch);
CREATE INDEX idx_branch_questions_difficulty ON branch_questions(difficulty);
