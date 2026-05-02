-- Script para fazer backup de todos os dados
-- Execute isso no banco atual para gerar o arquivo de backup

-- Backup das regras (essa será refeita na migração)
\copy (SELECT * FROM rules) to 'rules_backup.csv' WITH CSV HEADER;

-- Backup dos alunos
\copy (SELECT * FROM students) to 'students_backup.csv' WITH CSV HEADER;

-- Backup das ocorrências
\copy (SELECT * FROM occurrences) to 'occurrences_backup.csv' WITH CSV HEADER;

-- Backup dos acidentes
\copy (SELECT * FROM accidents) to 'accidents_backup.csv' WITH CSV HEADER;

-- Backup dos elogios
\copy (SELECT * FROM praises) to 'praises_backup.csv' WITH CSV HEADER;
