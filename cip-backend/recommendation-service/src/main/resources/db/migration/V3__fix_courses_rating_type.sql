-- V1 created rating as NUMERIC(2,1), but the Double entity field expects double precision
-- (ddl-auto=validate rejects the mismatch on startup). Never edit an already-applied migration.
ALTER TABLE courses ALTER COLUMN rating TYPE DOUBLE PRECISION;
