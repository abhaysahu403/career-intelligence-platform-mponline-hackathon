-- Baseline: matches the table Hibernate ddl-auto=update already created in existing environments.
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
