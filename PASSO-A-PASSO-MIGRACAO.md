# Migração de Dados do Supabase - Passo a Passo

## 📋 Resumo
Você vai exportar os dados do seu banco **antigo** e importar no **novo**. Tudo pelo Supabase Console (SQL Editor).

---

## 🚀 Passo 1: Criar Novo Projeto no Supabase

1. Vá para [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Escolha organização, nome do projeto e região
4. Aguarde a criação (~1-2 minutos)
5. Copie o **Project Reference ID** (você vai usar depois)

---

## 🔧 Passo 2: Criar Schema no Novo Banco

1. Abra o novo projeto no Supabase
2. Vá para **SQL Editor**
3. Clique em **"New Query"**
4. Abra o arquivo `scripts/01-schema-novo-banco.sql`
5. Copie **TODO** o conteúdo
6. Cole na query do Supabase
7. Clique em **"RUN"**

✅ **Schema criado!** Agora você tem todas as 5 tabelas (students, rules, occurrences, accidents, praises) com as 91 regras já preenchidas.

---

## 📤 Passo 3: Exportar Dados do Banco Antigo

1. Acesse o **projeto antigo** no Supabase (yzzzcoxeqazfebyfukty)
2. Vá para **SQL Editor**
3. Clique em **"New Query"**
4. Cole este SQL:

```sql
-- Exportar dados em JSON
SELECT 
  jsonb_build_object(
    'students', (SELECT jsonb_agg(row_to_json(students)) FROM students),
    'occurrences', (SELECT jsonb_agg(row_to_json(occurrences)) FROM occurrences),
    'accidents', (SELECT jsonb_agg(row_to_json(accidents)) FROM accidents),
    'praises', (SELECT jsonb_agg(row_to_json(praises)) FROM praises)
  ) as data;
```

5. Clique em **RUN**
6. Copie o resultado JSON completo

---

## 📥 Passo 4: Importar Dados no Novo Banco

### Se você copiou dados JSON:

1. Abra o **novo projeto** no Supabase
2. Vá para **SQL Editor** → **"New Query"**
3. Cole este template e substitua o JSON:

```sql
-- Importar Students
INSERT INTO students (id, name, class, shift, created_at)
VALUES 
  -- Copie e coleque aqui os dados dos alunos
;

-- Importar Occurrences
INSERT INTO occurrences (id, student_id, date, rule_code, registered_by, observations, created_at)
VALUES
  -- Copie e coleque aqui as ocorrências
;

-- Importar Accidents
INSERT INTO accidents (id, student_id, date, location, type, description, body_part, registered_by, parents_notified, medic_forwarded, observations, created_at)
VALUES
  -- Copie e coleque aqui os acidentes
;

-- Importar Praises
INSERT INTO praises (id, student_id, date, article, description, registered_by, created_at)
VALUES
  -- Copie e coleque aqui os elogios
;
```

4. Clique em **RUN**

---

## 🔄 Passo 5: Atualizar Variáveis de Ambiente

1. Vá para **Settings** → **API** no novo projeto
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (em Project API keys) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. No v0, abra **Settings** → **Vars**
4. Atualize essas variáveis com os novos valores

---

## ✅ Pronto!

Seu novo banco está pronto com:
- ✅ Schema completo (5 tabelas)
- ✅ 91 regras de disciplina
- ✅ Todos os alunos, ocorrências, acidentes e elogios migrados

Agora a aplicação vai conectar automaticamente ao novo banco!

---

## ⚠️ Dúvidas?

- **Schema não criou?** - Verifique se copiou TODO o script sem pular linhas
- **Dados não aparecem?** - Confira se as UUIDs dos alunos estão corretas nas ocorrências/acidentes/elogios
- **Erro de constraint?** - Verifique se as regras (rules) foram inseridas corretamente
