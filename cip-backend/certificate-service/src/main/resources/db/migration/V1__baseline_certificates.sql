-- Baseline: matches the tables Hibernate ddl-auto=update already created in existing environments.
CREATE TABLE IF NOT EXISTS certificates (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    file_name      VARCHAR(255) NOT NULL,
    file_url       VARCHAR(255),
    file_hash      VARCHAR(255),
    file_size      BIGINT,
    file_type      VARCHAR(255),
    status         VARCHAR(20) NOT NULL,
    error_message  TEXT,
    created_at     TIMESTAMP,
    updated_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);

CREATE TABLE IF NOT EXISTS certificate_results (
    id                   BIGSERIAL PRIMARY KEY,
    certificate_id       BIGINT NOT NULL UNIQUE,
    authenticity_score   INTEGER,
    status               VARCHAR(50),
    confidence_level     VARCHAR(50),
    extracted_data       JSONB,
    issuer_validation    JSONB,
    tampering_result     JSONB,
    id_validation        JSONB,
    component_scores     JSONB,
    reasons              JSONB,
    warnings             JSONB,
    processing_time_ms   INTEGER,
    created_at           TIMESTAMP
);
