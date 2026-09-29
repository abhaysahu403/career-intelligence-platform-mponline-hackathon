-- V3 created min_cgpa as NUMERIC(3,1), but the Double entity field expects double precision
-- (ddl-auto=validate rejects the mismatch on startup). Never edit an already-applied migration.
ALTER TABLE government_jobs ALTER COLUMN min_cgpa TYPE DOUBLE PRECISION;
