-- Ensure ID columns have the correct random UUID default
ALTER TABLE students ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE occurrences ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE accidents ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE praises ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE summons ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE conduct_terms ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Adicionar as colunas faltantes, caso a tabela já exista
ALTER TABLE students ADD COLUMN IF NOT EXISTS points NUMERIC NOT NULL DEFAULT 10.0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS contacts JSONB;
ALTER TABLE students ADD COLUMN IF NOT EXISTS observation TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "birthDate" TEXT;

-- occurrences columns
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS hour TEXT;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS located_by TEXT;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS video_urls JSONB;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS signed_doc_urls JSONB;

-- Atualizar o cache do Supabase imediatamente
NOTIFY pgrst, 'reload schema';
