ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS slug VARCHAR(120) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_student_profiles_slug ON student_profiles(slug);
