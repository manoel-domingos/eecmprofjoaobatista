-- ========================================
-- SCRIPT 1: Criar Schema no Novo Banco
-- ========================================
-- Copie e cole TUDO isso no SQL Editor do novo projeto Supabase
-- Clique em "RUN" para executar

-- Create Enum Types
CREATE TYPE severity_level AS ENUM ('Leve', 'Media', 'Grave');
CREATE TYPE school_shift AS ENUM ('Matutino', 'Vespertino', 'Noturno');
CREATE TYPE praise_article AS ENUM ('Art. 50', 'Art. 51');

-- Create Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  shift school_shift NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Rules Table
CREATE TABLE rules (
  code INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  severity severity_level NOT NULL,
  points NUMERIC NOT NULL,
  measure TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Occurrences Table
CREATE TABLE occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  rule_code INTEGER NOT NULL REFERENCES rules(code),
  registered_by TEXT NOT NULL,
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Accidents Table
CREATE TABLE accidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  body_part TEXT NOT NULL,
  registered_by TEXT NOT NULL,
  parents_notified BOOLEAN NOT NULL DEFAULT false,
  medic_forwarded BOOLEAN NOT NULL DEFAULT false,
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Praises Table
CREATE TABLE praises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  article praise_article NOT NULL,
  description TEXT NOT NULL,
  registered_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Initial Rules (91 rules)
INSERT INTO rules (code, description, severity, points, measure) VALUES
(1, 'Apresentar-se com uniforme diferente do estabelecido', 'Leve', -0.1, 'Advertência Oral'),
(2, 'Apresentar-se com barba ou bigode sem fazer', 'Leve', -0.1, 'Advertência Oral'),
(3, 'Cabelo desalinhado ou fora do padrão', 'Leve', -0.1, 'Advertência Oral'),
(4, 'Chegar atrasado sem justificativa', 'Leve', -0.1, 'Advertência Oral'),
(5, 'Comparecer sem material escolar necessário', 'Leve', -0.1, 'Advertência Oral'),
(6, 'Adentrar dependências sem autorização', 'Leve', -0.1, 'Advertência Oral'),
(7, 'Consumir alimentos ou mascar chicletes em aula/forma', 'Leve', -0.1, 'Advertência Oral'),
(8, 'Conversar ou se mexer quando estiver em forma', 'Leve', -0.1, 'Advertência Oral'),
(9, 'Deixar de entregar objeto encontrado na escola', 'Leve', -0.1, 'Advertência Oral'),
(10, 'Deixar de retribuir cumprimentos ou sinais de respeito', 'Leve', -0.1, 'Advertência Oral'),
(11, 'Deixar material/peças de uniforme em locais inapropriados', 'Leve', -0.1, 'Advertência Oral'),
(12, 'Descartar lixo fora dos locais apropriados', 'Leve', -0.1, 'Advertência Oral'),
(13, 'Dobrar peça de uniforme desfigurando originalidade', 'Leve', -0.1, 'Advertência Oral'),
(14, 'Dormir durante o horário das aulas ou instruções', 'Leve', -0.1, 'Advertência Oral'),
(15, 'Executar movimentos de ordem unida de forma displicente', 'Leve', -0.1, 'Advertência Oral'),
(16, 'Provocar ruídos excessivos em dependências da escola', 'Leve', -0.1, 'Advertência Oral'),
(17, 'Não informar autoridade sobre falta presenciada', 'Leve', -0.1, 'Advertência Oral'),
(18, 'Perturbar o estudo dos colegas com ruídos/brincadeiras', 'Leve', -0.1, 'Advertência Oral'),
(19, 'Utilizar publicação estranha à atividade escolar', 'Leve', -0.1, 'Advertência Oral'),
(20, 'Retardar ou contribuir para o atraso de execuções', 'Leve', -0.1, 'Advertência Oral'),
(21, 'Sentar-se no chão uniformizado (exceto Ed. Física)', 'Leve', -0.1, 'Advertência Oral'),
(22, 'Utilizar jogo, brinquedo ou coleções sem autorização', 'Leve', -0.1, 'Advertência Oral'),
(23, 'Uso indevido de piercing/brincos (Alunas)', 'Leve', -0.1, 'Advertência Oral'),
(24, 'Uso indevido de piercing/brincos (Alunos)', 'Leve', -0.1, 'Advertência Oral'),
(25, 'Usar boné, capuz ou adornos uniformizado em aula', 'Leve', -0.1, 'Advertência Oral'),
(26, 'Ficar na sala de aula durante intervalos/formaturas', 'Leve', -0.1, 'Advertência Oral'),
(27, 'Atrasar ou não atender chamado da Diretoria/Coordenação', 'Media', -0.3, 'Advertência Escrita'),
(28, 'Faltar a atividade extraclasse sem justificativa', 'Media', -0.3, 'Advertência Escrita'),
(29, 'Faltar a atividades escolares ou formaturas', 'Media', -0.3, 'Advertência Escrita'),
(30, 'Deixar de cumprir medidas disciplinares impostas', 'Media', -0.3, 'Advertência Escrita'),
(31, 'Deixar de devolver documentos assinados no prazo', 'Media', -0.3, 'Advertência Escrita'),
(32, 'Deixar de devolver livros ou materiais da biblioteca', 'Media', -0.3, 'Advertência Escrita'),
(33, 'Não entregar documento encaminhado aos pais', 'Media', -0.3, 'Advertência Escrita'),
(34, 'Deixar de executar tarefas atribuídas pela direção', 'Media', -0.3, 'Advertência Escrita'),
(35, 'Desleixo com apresentação pessoal', 'Media', -0.3, 'Advertência Escrita'),
(36, 'Dirigir memoriais ou petições sem autorização', 'Media', -0.3, 'Advertência Escrita'),
(37, 'Entrar ou sair da escola por locais não permitidos', 'Media', -0.3, 'Advertência Escrita'),
(38, 'Espalhar boatos ou notícias tendenciosas', 'Media', -0.3, 'Advertência Escrita'),
(39, 'Tocar a sirene sem permissão', 'Media', -0.3, 'Advertência Escrita'),
(40, 'Fumar uniformizado ou nas imediações da escola', 'Media', -0.3, 'Advertência Escrita'),
(41, 'Ingressar ou sair sem uniforme ou trocar em locais proibidos', 'Media', -0.3, 'Advertência Escrita'),
(42, 'Ler ou distribuir publicações contra disciplina/moral', 'Media', -0.3, 'Advertência Escrita'),
(43, 'Contato físico de cunho amoroso uniformizado', 'Media', -0.3, 'Advertência Escrita'),
(44, 'Não zelar pelo nome da Instituição (Uniformizado)', 'Media', -0.3, 'Advertência Escrita'),
(45, 'Negar-se a colaborar em eventos escolares oficiais', 'Media', -0.3, 'Advertência Escrita'),
(46, 'Ofender moral de colegas ou membros da comunidade', 'Media', -0.3, 'Advertência Escrita'),
(47, 'Portar-se de forma inconveniente em aula ou recreio', 'Media', -0.3, 'Advertência Escrita'),
(48, 'Comportamento desrespeitoso em eventos sociais/esportivos', 'Media', -0.3, 'Advertência Escrita'),
(49, 'Proferir palavras de baixo calão ou grafá-las', 'Media', -0.3, 'Advertência Escrita'),
(50, 'Propor ou aceitar transação pecuniária sem autorização', 'Media', -0.3, 'Advertência Escrita'),
(51, 'Provocar ou disseminar a discórdia entre colegas', 'Media', -0.3, 'Advertência Escrita'),
(52, 'Exposição negativa de colegas em meios virtuais', 'Media', -0.3, 'Advertência Escrita'),
(53, 'Retirar ou tentar retirar objeto sem autorização', 'Media', -0.3, 'Advertência Escrita'),
(54, 'Sair da escola sem a devida autorização', 'Media', -0.3, 'Advertência Escrita'),
(55, 'Entrar ou sair da sala de aula sem permissão', 'Media', -0.3, 'Advertência Escrita'),
(56, 'Ser retirado de atividade por mau comportamento', 'Media', -0.3, 'Advertência Escrita'),
(57, 'Simular doenças para esquivar-se de obrigações', 'Media', -0.3, 'Advertência Escrita'),
(58, 'Tomar parte em jogos de azar ou apostas', 'Media', -0.3, 'Advertência Escrita'),
(59, 'Usar instalações esportivas sem uniforme adequado', 'Media', -0.3, 'Advertência Escrita'),
(60, 'Usar uniforme ou nome da escola em local inapropriado', 'Media', -0.3, 'Advertência Escrita'),
(61, 'Uso não autorizado de telefone celular em aula', 'Media', -0.3, 'Advertência Escrita'),
(62, 'Usar indevidamente distintivos ou insígnias', 'Media', -0.3, 'Advertência Escrita'),
(63, 'Assinar documento pelos pais ou responsáveis', 'Grave', -0.5, 'Suspensão'),
(64, 'Causar danos intencionais ao patrimônio escolar', 'Grave', -0.5, 'Suspensão'),
(65, 'Causar ou contribuir para acidentes de qualquer natureza', 'Grave', -0.5, 'Suspensão'),
(66, 'Comunicação indevida (colar) em avaliações', 'Grave', -0.5, 'Suspensão'),
(67, 'Denegrir nome da escola ou membros em redes sociais', 'Grave', -0.5, 'Suspensão'),
(68, 'Desobedecer ou desafiar autoridade de Direção/Monitores', 'Grave', -0.5, 'Suspensão'),
(69, 'Apologia a drogas, violência ou pornografia', 'Grave', -0.5, 'Suspensão'),
(70, 'Entrar ou ausentar-se da escola sem autorização', 'Grave', -0.5, 'Suspensão'),
(71, 'Extraviar documentos sob sua responsabilidade', 'Grave', -0.5, 'Suspensão'),
(72, 'Faltar com a verdade ou usar anonimato indevido', 'Grave', -0.5, 'Suspensão'),
(73, 'Uso ou indução ao uso de bebida alcoólica/drogas', 'Grave', -0.5, 'Suspensão'),
(74, 'Hastear ou arriar bandeiras sem autorização', 'Grave', -0.5, 'Suspensão'),
(75, 'Instigar colegas a cometerem faltas graves', 'Grave', -0.5, 'Suspensão'),
(76, 'Contato físico com denotação libidinosa', 'Grave', -0.5, 'Suspensão'),
(77, 'Publicação difamatória contra membros da comunidade', 'Grave', -0.5, 'Suspensão'),
(78, 'Prática de Bullying ou Cyberbullying', 'Grave', -0.5, 'Suspensão'),
(79, 'Pichar ou causar poluição visual/sonora nas imediações', 'Grave', -0.5, 'Suspensão'),
(80, 'Portar armas ou objetos perfurocortantes (estiletes, etc)', 'Grave', -0.5, 'Suspensão'),
(81, 'Atos contrários ao respeito aos símbolos nacionais', 'Grave', -0.5, 'Suspensão'),
(82, 'Macular nome da escola em manifestações coletivas', 'Grave', -0.5, 'Suspensão'),
(83, 'Promover trotes de qualquer natureza', 'Grave', -0.5, 'Suspensão'),
(84, 'Rixas ou luta corporal dentro ou fora da escola', 'Grave', -0.5, 'Suspensão'),
(85, 'Participação em manifestações de natureza política', 'Grave', -0.5, 'Suspensão'),
(86, 'Rasurar, violar ou alterar documentos oficiais', 'Grave', -0.5, 'Suspensão'),
(87, 'Representar a escola sem estar autorizado', 'Grave', -0.5, 'Suspensão'),
(88, 'Distribuir materiais de cunho político-partidário', 'Grave', -0.5, 'Suspensão'),
(89, 'Subtrair indevidamente valores ou objetos alheios', 'Grave', -0.5, 'Suspensão'),
(90, 'Processos fraudulentos em trabalhos acadêmicos', 'Grave', -0.5, 'Suspensão'),
(91, 'Destruição do patrimônio pertencente à escola', 'Grave', -0.5, 'Suspensão');
