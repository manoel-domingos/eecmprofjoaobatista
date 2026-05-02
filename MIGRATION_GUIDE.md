# Guia de Migração - Supabase

## Passos para migrar dados para um novo projeto Supabase

### 1️⃣ Criar novo projeto no Supabase
- Acesse [app.supabase.com](https://app.supabase.com)
- Clique em "New project"
- Preencha os dados e crie o projeto
- Copie o **Project Reference ID** (ex: `abcdefghijklmnopqrst`)

### 2️⃣ Exportar dados do banco atual
Execute no seu terminal local:
```bash
cd /vercel/share/v0-project
supabase db dump --local > backup_completo.sql
```

Ou usando psql diretamente (se tiver acesso):
```bash
pg_dump --data-only -h localhost -U postgres -d postgres > data_only.sql
```

### 3️⃣ Unlink do projeto antigo e link ao novo
```bash
# Remover link do projeto antigo
supabase unlink

# Link ao novo projeto
supabase link --project-ref seu_novo_project_ref
```

### 4️⃣ Aplicar schema no novo banco
```bash
# Isso aplicará todas as migrations
supabase db push
```

### 5️⃣ Restaurar dados (sem as regras)
Se tiver o arquivo de dump do passo 2:
```bash
# Conectar ao novo banco e restaurar apenas os dados
PGPASSWORD=sua_senha psql -h db.seu_novo_project_ref.supabase.co \
  -U postgres -d postgres -f backup_completo.sql
```

### ⚠️ Importante
- **As 91 regras de disciplina** serão recriadas automaticamente na migration
- **UUIDs dos alunos** podem mudar se fizer um novo dump/restore
- Atualize as **variáveis de ambiente** no seu projeto para apontar ao novo banco

## Alternativa: Usando Interface Supabase

1. Exporte dados via Console Supabase (antiga base) → Data → Export
2. Importe no novo projeto via Console → Data → Upload
3. Ou use o SQL Editor para INSERT direto

## Verificar se funcionou

```bash
# Conectar ao novo banco
supabase db connect

# Verificar se dados estão lá
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM rules;
SELECT COUNT(*) FROM occurrences;
```
