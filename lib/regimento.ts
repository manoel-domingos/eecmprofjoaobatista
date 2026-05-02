/**
 * Corpus do Regimento Interno e Manual Disciplinar
 * E.E. Cívico-Militar Prof. João Batista
 *
 * Este arquivo é a fonte primária para todas as recomendações geradas pela IA.
 * A IA deve consultar este corpus ANTES de qualquer fonte externa.
 */

export const REGIMENTO_CORPUS = `
=== REGIMENTO INTERNO — E.E. CÍVICO-MILITAR PROF. JOÃO BATISTA ===

--- CAPÍTULO I: CLASSIFICAÇÃO DAS INFRAÇÕES ---

NATUREZA LEVE (Arts. 1–26) | Medida padrão: Advertência Oral | Impacto: -0,10 pts
- Irregularidades de uniforme, apresentação pessoal, atrasos, comportamento em aula.
- Procedimento: advertência verbal pelo professor/monitor; registro na ficha do aluno.
- Reincidência em Leve: eleva para Advertência Escrita (Art. 35 § 3º).
- Acúmulo de 3 ou mais Leves: medida se agrava para Suspensão (Art. 35 § 4º).

NATUREZA MÉDIA (Arts. 27–62) | Medida padrão: Advertência Escrita | Impacto: -0,30 pts
- Descumprimento de ordens, comportamento inconveniente, desonestidade menor.
- Procedimento: comunicado formal aos responsáveis; registro no sistema; reunião pedagógica recomendada.
- Reincidência em Média: eleva para Suspensão (Art. 35 § 4º).

NATUREZA GRAVE (Arts. 63–91) | Medida padrão: Suspensão | Impacto: -0,50 pts
- Violência, porte de armas, uso de drogas, bullying, dano ao patrimônio, fraude.
- Procedimento: Suspensão de 1 a 5 dias letivos; notificação imediata aos responsáveis; Conselho de Classe extraordinário; possibilidade de transferência compulsória nos casos mais graves.

--- CAPÍTULO II: MEDIDAS ADMINISTRATIVAS DISPONÍVEIS ---

1. ADVERTÊNCIA ORAL
   - Aplicação: infrações Leve de primeiro cometimento.
   - Executor: professor, monitor ou coordenador.
   - Registro: ficha de acompanhamento individual.

2. ADVERTÊNCIA ESCRITA
   - Aplicação: infrações Médias ou reincidência em Leve.
   - Executor: coordenador ou diretor.
   - Registro: Termo de Advertência Escrita assinado pelo responsável.
   - Prazo para assinatura: 3 dias úteis.

3. ATIVIDADE PEDAGÓGICA
   - Aplicação: medida complementar a qualquer nível, especialmente em Médias.
   - Objetivo: reflexão e ressignificação do comportamento.
   - Executor: professor orientador ou coordenação pedagógica.
   - Exemplos: redação reflexiva, trabalho comunitário interno, pesquisa temática.

4. RETENÇÃO DO RECREIO
   - Aplicação: infrações Leve a Média; alternativa pedagógica.
   - Executor: monitor de turno.
   - Limite: máximo 3 retenções consecutivas; acima disso, adotar Advertência Escrita.

5. SUSPENSÃO
   - Aplicação: infrações Graves ou reincidência em Média.
   - Duração padrão: 1 a 5 dias letivos.
   - Executor: diretor da unidade.
   - Obrigações: notificação escrita aos responsáveis; proposta de atividade domiciliar.
   - Registro: Ata de Suspensão; envio ao Núcleo Regional de Educação (NRE) se > 3 dias.

6. TRANSFERÊNCIA COMPULSÓRIA
   - Aplicação: casos extremos — reincidência em Grave, ameaça à comunidade escolar.
   - Executor: diretor + conselho escolar.
   - Procedimento: parecer do Conselho Tutelar; notificação ao NRE; prazo de 10 dias úteis.

--- CAPÍTULO III: ESCALADA E AGRAVAMENTO ---

Art. 35 — Circunstâncias agravantes:
§ 1º Reincidência na mesma infração dobra a gravidade da medida.
§ 2º Envolvimento de mais de um aluno: medida aplicada a todos os participantes.
§ 3º Reincidência em Leve → Advertência Escrita.
§ 4º Acúmulo de 3 Leves ou Reincidência em Média → Suspensão.
§ 5º Reincidência em Grave → Suspensão máxima + encaminhamento ao NRE.

Art. 36 — Circunstâncias atenuantes:
§ 1º Primeiro cometimento: reduz impacto em pontos à metade.
§ 2º Confissão espontânea: possibilidade de conversão para medida pedagógica.
§ 3º Colaboração nas investigações: considerada pelo conselho ao definir a medida.

--- CAPÍTULO IV: PROCEDIMENTOS PÓS-REGISTRO ---

Após lavrar a ATA, o responsável pelo registro deve:
1. Comunicar imediatamente os pais/responsáveis (presencialmente ou via WhatsApp/ligação).
2. Agendar reunião com responsável em até 5 dias úteis para infrações Médias e Graves.
3. Encaminhar cópia da ATA à Coordenação Pedagógica.
4. Para infrações Graves: notificar o Conselho Tutelar se houver reincidência ou risco ao aluno.
5. Inserir ocorrência no sistema de acompanhamento disciplinar.
6. Propor intervenção pedagógica ao professor orientador.

--- CAPÍTULO V: ORIENTAÇÕES PEDAGÓGICAS E DE APOIO ---

Para comportamentos recorrentes ou graves, o Regimento recomenda:
- Encaminhamento ao psicopedagogo/assistente social da unidade.
- Elaboração de Plano Individual de Atendimento (PIA) para alunos com ≥ 3 ocorrências no semestre.
- Reunião de equipe multidisciplinar para alunos com histórico de violência ou drogas.
- Acionamento da Rede de Proteção (Conselho Tutelar, CRAS, CAPS) quando identificado vulnerabilidade.
- Contato com a família para acompanhamento conjunto do comportamento.

--- MANUAL DISCIPLINAR — ORIENTAÇÕES AOS GESTORES ---

Ao redigir recomendações pós-ATA, o gestor deve:
a) Basear-se exclusivamente nas medidas previstas neste Regimento.
b) Indicar o artigo correspondente em cada recomendação.
c) Priorizar medidas pedagógicas antes de medidas punitivas quando tratar-se de primeiro cometimento.
d) Verificar histórico do aluno antes de recomendar escalada de medida.
e) Documentar todas as ações em linguagem formal e objetiva.

Fluxo recomendado de resposta a uma ocorrência:
Leve 1ª vez → Advertência Oral + registro
Leve 2ª vez (mesma infração) → Advertência Escrita + comunicado aos pais
3ª ocorrência Leve → Suspensão 1 dia + reunião com família
Média 1ª vez → Advertência Escrita + reunião em até 5 dias
Média 2ª vez → Suspensão 1–3 dias + encaminhamento pedagógico
Grave → Suspensão 3–5 dias + Conselho de Classe + eventual NRE
`.trim();

/**
 * Instrução de hierarquia de fontes para a IA.
 * Sempre injetada no system prompt de tipos que geram recomendações.
 */
export const HIERARQUIA_FONTES = `
HIERARQUIA DE FONTES (OBRIGATÓRIA):
1. PRIORIDADE MÁXIMA: utilize exclusivamente as normas, artigos e procedimentos do REGIMENTO INTERNO acima.
2. PRIORIDADE SECUNDÁRIA: legislação educacional brasileira (LDB, ECA, resoluções estaduais).
3. ÚLTIMO RECURSO: conhecimento geral pedagógico — apenas quando o Regimento não cobrir o caso específico.
Sempre cite o artigo ou capítulo do Regimento que embasa cada recomendação.
Nunca invente normas. Se o Regimento for omisso, sinalize explicitamente.
`.trim();
