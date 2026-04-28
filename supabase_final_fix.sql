-- Final fix for occurrences table
ALTER TABLE IF EXISTS occurrences 
ADD COLUMN IF NOT EXISTS hour TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS located_by TEXT,
ADD COLUMN IF NOT EXISTS student_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS signed_doc_urls TEXT[] DEFAULT '{}';

-- Fix rule_code type if necessary (should be integer but some might have it as text)
-- ALTER TABLE occurrences ALTER COLUMN rule_code TYPE INTEGER USING (rule_code::integer);
