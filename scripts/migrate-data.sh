#!/bin/bash

# Script para migrar dados para novo projeto Supabase
# Uso: ./scripts/migrate-data.sh <novo-project-ref>

if [ -z "$1" ]; then
    echo "Uso: ./scripts/migrate-data.sh <novo-project-ref>"
    echo "Exemplo: ./scripts/migrate-data.sh abcdefghijklmnopqrst"
    exit 1
fi

NEW_PROJECT_REF="$1"

echo "🔄 Iniciando migração de dados para novo projeto Supabase..."
echo "Projeto destino: $NEW_PROJECT_REF"

# 1. Link ao novo projeto
echo "📌 Linkando ao novo projeto..."
supabase link --project-ref "$NEW_PROJECT_REF"

# 2. Aplicar migrations
echo "🏗️  Aplicando schema no novo projeto..."
supabase db push

# 3. Restaurar dados (se existirem backups)
if [ -f "rules_backup.csv" ]; then
    echo "📥 Restaurando regras..."
    supabase db push < rules_backup.sql
fi

if [ -f "students_backup.csv" ]; then
    echo "📥 Restaurando alunos..."
    supabase db push < students_backup.sql
fi

if [ -f "occurrences_backup.csv" ]; then
    echo "📥 Restaurando ocorrências..."
    supabase db push < occurrences_backup.sql
fi

if [ -f "accidents_backup.csv" ]; then
    echo "📥 Restaurando acidentes..."
    supabase db push < accidents_backup.sql
fi

if [ -f "praises_backup.csv" ]; then
    echo "📥 Restaurando elogios..."
    supabase db push < praises_backup.sql
fi

echo "✅ Migração concluída!"
