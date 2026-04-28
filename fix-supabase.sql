-- Fix occurrences table schema
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS hour TEXT;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS located_by TEXT;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS video_urls JSONB;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS signed_doc_urls JSONB;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS student_ids JSONB;

-- Update rule_code to be just INTEGER if it was changed to something else by mistake
-- ALTER TABLE occurrences ALTER COLUMN rule_code TYPE INTEGER USING (rule_code[1])::INTEGER; -- Only run this if rule_code was an array

-- Ensure other tables are also up to date (students)
ALTER TABLE students ADD COLUMN IF NOT EXISTS points NUMERIC DEFAULT 10.0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS contacts JSONB;
ALTER TABLE students ADD COLUMN IF NOT EXISTS observation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "birthDate" TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
