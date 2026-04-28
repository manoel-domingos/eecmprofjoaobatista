-- Update table: occurrences to include video and document urls
ALTER TABLE IF EXISTS occurrences 
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS signed_doc_urls TEXT[] DEFAULT '{}';

-- Storage Setup (Bucket creation often requires administrative permissions)
-- You may need to create these buckets manually in the Supabase Dashboard > Storage
-- Buckets to create: 'evidence' and 'signs' (set them to Public if you want easy access)

-- If you want to enable storage via SQL (requires supabase_admin or equivalent):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true) ON CONFLICT (id) DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('signs', 'signs', true) ON CONFLICT (id) DO NOTHING;
