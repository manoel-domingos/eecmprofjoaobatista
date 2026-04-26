-- Enable UUID extension (if you need it for other things, though gen_random_uuid() is built-in)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: students
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  shift TEXT NOT NULL,
  points NUMERIC NOT NULL DEFAULT 10.0,
  contacts JSONB,
  observation TEXT,
  address TEXT,
  cpf TEXT,
  "registrationNumber" TEXT,
  "birthDate" TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: rules
CREATE TABLE IF NOT EXISTS rules (
  code INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  points NUMERIC NOT NULL,
  measure TEXT NOT NULL
);

-- Table: occurrences
CREATE TABLE IF NOT EXISTS occurrences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  rule_code INTEGER REFERENCES rules(code),
  registered_by TEXT,
  observations TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: accidents
CREATE TABLE IF NOT EXISTS accidents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  location TEXT,
  type TEXT,
  description TEXT,
  body_part TEXT,
  registered_by TEXT,
  parents_notified BOOLEAN,
  medic_forwarded BOOLEAN,
  observations TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: praises
CREATE TABLE IF NOT EXISTS praises (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  article TEXT,
  description TEXT,
  registered_by TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: summons
CREATE TABLE IF NOT EXISTS summons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT,
  reason TEXT,
  department TEXT,
  registered_by TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: conduct_terms
CREATE TABLE IF NOT EXISTS conduct_terms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  guardian_name TEXT,
  commitments TEXT,
  registered_by TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_name TEXT, 
  entity_id TEXT, 
  details TEXT,
  user_email TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);
