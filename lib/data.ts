'use client';

export type Severity = 'Leve' | 'Media' | 'Grave';
export type Shift = 'Matutino' | 'Vespertino' | 'Noturno';
export type BehaviorClass = 'Excepcional' | 'Ótimo' | 'Bom' | 'Regular' | 'Insuficiente' | 'Incompatível';
export type PraiseType = 'Individual' | 'Coletivo' | 'Art. 50' | 'Art. 51';

export interface Student {
  id: string;
  name: string;
  class: string;
  shift: Shift;
  points: number; // Starts at 8.0 according to Art. 45 § 2º
  contacts?: { name: string, phone: string }[];
  observation?: string;
  address?: string;
  cpf?: string;
  registrationNumber?: string;
  birthDate?: string;
  archived?: boolean;
}

export interface DisciplineRule {
  code: number;
  description: string;
  severity: Severity;
  points: number; // e.g. -0.1, -0.3, -0.5
  measure: string;
}

export interface Occurrence {
  id: string;
  studentId: string;
  date: string;
  hour?: string;
  location?: string;
  locatedBy?: string;
  ruleCode: number;
  registeredBy: string;
  observations?: string;
  archived?: boolean;
  videoUrls?: string[];
  signedDocUrls?: string[];
  durationDays?: number; // Added for correct suspension points (Art. 46 III)
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Monitor' | 'Professor' | 'Coord.' | 'Diretora' | 'G1' | 'G2';
}

export interface Accident {
  id: string;
  studentId: string;
  date: string;
  location: string;
  type: string;
  description: string;
  bodyPart: string;
  registeredBy: string;
  parentsNotified: boolean;
  medicForwarded: boolean;
  observations?: string;
  archived?: boolean;
}

export interface Praise {
  id: string;
  studentId: string;
  date: string;
  type: PraiseType;
  description: string;
  registeredBy: string;
  archived?: boolean;
}

export interface Summons {
  id: string;
  studentId: string;
  date: string;
  time: string;
  reason: string;
  department: string;
  registeredBy: string;
  archived?: boolean;
}

export interface ConductTerm {
  id: string;
  studentId: string;
  date: string;
  guardianName: string;
  commitments: string;
  registeredBy: string;
  archived?: boolean;
}

export type AppUserRole = 'GESTOR' | 'COORD' | 'MONITOR';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: AppUserRole;
}

export interface AuditLog {
  id: string;
  date: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SYSTEM';
  entityName: string;
  entityId: string;
  details: string;
  userEmail: string;
}

export const INITIAL_RULES: DisciplineRule[] = [
  // FALTAS DISCIPLINARES DE NATUREZA LEVE (1-26) -0.10
  { code: 1, description: "Apresentar-se com uniforme diferente do estabelecido pelo regulamento do uniforme", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 2, description: "Apresentar-se com barba ou bigode sem fazer", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 3, description: "Comparecer à EECM com cabelo em desalinho ou fora do padrão estabelecido pelas diretrizes dos Uniformes e do Regimento Escolar", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 4, description: "Chegar atrasado a EECM para o início das aulas, instrução, treinamento, formatura ou atividade escolar", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 5, description: "Comparecer a EECM sem levar o material necessário", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 6, description: "Adentrar ou permanecer em qualquer dependência da EECM, sem autorização", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 7, description: "Consumir alimentos, balas, doces líquidos ou mascar chicletes durante a aula, instrução, treinamento, formatura, atividade escolar, e nas dependências da EECM, salvo quando devidamente autorizado", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 8, description: "Conversar ou se mexer quando estiver em forma", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 9, description: "Deixar de entregar à Monitoria, Secretaria ou a Coordenação, qualquer objeto que não lhe pertença que tenha encontrado na EECM", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 10, description: "Deixar de retribuir cumprimentos ou de prestar sinais de respeito regulamentares, previstos no Manual do Aluno", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 11, description: "Deixar material escolar, objetos ou peças de uniforme em locais inapropriados dentro ou fora da unidade escolar", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 12, description: "Descartar papéis, restos de comida, embalagens ou qualquer objeto no chão ou fora de locais apropriados", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 13, description: "Dobrar qualquer peça de uniforme para diminuir seu tamanho, desfigurando sua originalidade", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 14, description: "Debruçar-se sobre a carteira e/ou dormir durante o horário das aulas ou instruções", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 15, description: "Executar movimentos de ordem unida de forma displicente ou desatenciosa", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 16, description: "Fazer ou provocar excessivo barulho em qualquer dependência da EECM, durante o horário de aula", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 17, description: "Não levar ao conhecimento de autoridade competente falta ou irregularidade que presenciar ou de que tiver ciência", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 18, description: "Perturbar o estudo do(s) colega(s), com ruídos ou brincadeiras", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 19, description: "Utilizar-se, na sala, de qualquer publicação estranha à sua atividade escolar, salvo quando autorizado", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 20, description: "Retardar ou contribuir para o atraso da execução de qualquer atividade sem justo motivo", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 21, description: "Sentar-se no chão, atentando contra a postura e compostura, estando uniformizado, exceto quando em aula de educação Física", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 22, description: "Utilizar qualquer tipo de jogo, brinquedo, figurinhas, coleções no interior da EECM", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 23, description: "Usar, a aluna, piercing, anel e brinco fora do padrão estabelecido, mais de um brinco em cada orelha, alargador ou similares, quando uniformizado, durante a aula, instrução, treinamento, formatura ou atividade escolar", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 24, description: "Usar, o aluno, piercings, brinco, alargador ou similares, quando uniformizado, durante a aula, instrução, treinamento, formatura ou atividade escolar", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 25, description: "Usar, quando uniformizado, boné, capuz ou outros adornos, durante a atividade escolar", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 26, description: "Ficar na sala de aula durante os intervalos e as formaturas diárias", severity: "Leve", points: -0.1, measure: "Advertência Oral" },

  // FALTAS DISCIPLINARES DE NATUREZA MÉDIA (27-62) -0.30
  { code: 27, description: "Atrasar ou deixar de atender ao chamado da Diretoria, coordenação, Oficial de Gestão Educacional-Militar, o Oficial de Gestão Cívico-Militar, Monitores, professores ou servidores no exercício de sua função", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 28, description: "Deixar de comparecer a qualquer atividade extraclasse para a qual tenha sido designado, exceto quando devidamente justificado", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 29, description: "Deixar de comparecer às atividades escolares, formaturas, ou delas se ausentar, sem autorização", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 30, description: "Deixar de cumprir ou esquivar-se de medidas disciplinares impostas pelo Gestor Educacional-Militar e Gestor Cívico Militar", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 31, description: "Deixar de devolver à EECM, dentro do prazo estipulado, documentos devidamente assinados pelo seu responsável", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 32, description: "Deixar de devolver, no prazo fixado, livros da biblioteca ou outros materiais pertencentes às EECM", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 33, description: "Deixar de entregar ao pai ou responsável, documento que lhe foi encaminhado pela EECM", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 34, description: "Deixar de executar tarefas atribuídas da Diretoria, coordenação, Oficial de Gestão Educacional-Militar, o Oficial de Gestão Cívico-Militar, Monitores, professores ou servidores no exercício de sua função", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 35, description: "Deixar de zelar por sua apresentação pessoal", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 36, description: "Dirigir memoriais ou petições a qualquer autoridade, sobre assuntos da alçada da Diretoria e do Oficial de Gestão Educacional-Militar", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 37, description: "Entrar ou sair da EECM por locais não permitidos", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 38, description: "Espalhar boatos ou notícias tendenciosas por qualquer meio", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 39, description: "Tocar a sirene, sem ordem para tal", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 40, description: "Fumar dentro ou nas imediações da EECM ou quando uniformizado", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 41, description: "Ingressar ou sair da EECM sem estar com o uniforme regulamentar, bem como trocar de roupa (trajes civis) dentro da EECM ou em suas imediações", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 42, description: "Ler ou distribuir, dentro da EECM, publicações estampas ou jornais que atentem contra a disciplina, a moral e a ordem pública", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 43, description: "Manter contato físico que denote envolvimento de cunho amoroso (namoro, beijos, etc.) quando devidamente uniformizado, dentro da EECM ou fora dele", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 44, description: "Não zelar pelo nome da Instituição que representa, deixando de portar-se adequadamente em qualquer ambiente, quando uniformizado ou em atividades relacionadas a EECM", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 45, description: "Negar-se a colaborar ou participar nos eventos, formaturas, solenidades e desfiles oficiais da EECM", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 46, description: "Ofender o moral de colegas ou de qualquer membro da Comunidade Escolar por atos, gestos ou palavras", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 47, description: "Portar-se de forma inconveniente em sala de aula ou outro local de instrução/recreação, bem como transportes de uso coletivo", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 48, description: "Portar-se de maneira desrespeitosa ou inconveniente nos eventos sociais ou esportivos, promovidos ou com a participação da EECM ou fora dela", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 49, description: "Proferir palavras de baixo calão, incompatíveis com as normas da boa educação, ou grafálas em qualquer lugar", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 50, description: "Propor ou aceitar transação pecuniária de qualquer natureza, no interior da EECM, sem a devida autorização", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 51, description: "Provocar ou disseminar a discórdia entre colegas", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 52, description: "Publicar ou contribuir para que sejam publicadas mensagens, fotos, vídeos ou qualquer outro documento, na Internet ou qualquer outro meio de comunicação, que possam expor qualquer integrante da EECM", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 53, description: "Retirar ou tentar retirar objeto, de qualquer dependência da EECM, ou mesmo deles servir-se, sem ordem do responsável e/ou do proprietário", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 54, description: "Sair de forma sem autorização", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 55, description: "Sair, entrar ou permanecer na sala de aula sem permissão", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 56, description: "Ser retirado, por mau comportamento, de sala de aula ou qualquer ambiente em que esteja sendo realizada atividade", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 57, description: "Simular doenças para esquivar-se ao atendimento de obrigações e de atividades escolares", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 58, description: "Tomar parte em jogos de azar ou em apostas na unidade escolar ou fora dela, uniformizados ou não", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 59, description: "Usar as instalações ou equipamentos esportivos do EECM, sem uniformes adequados, ou sem autorização", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 60, description: "Usar o uniforme ou o nome do EECM em ambiente inapropriado", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 61, description: "Utilizar, sem autorização, telefones celulares ou quaisquer aparelhos eletrônicos ou não, durante as atividades escolares", severity: "Media", points: -0.3, measure: "Advertência Escrita" },
  { code: 62, description: "Usar indevidamente distintivos ou insígnias", severity: "Media", points: -0.3, measure: "Advertência Escrita" },

  // FALTAS DISCIPLINARES DE NATUREZA GRAVE (63-91) -0.50
  { code: 63, description: "Assinar pelo responsável, documento que deve ser entregue à unidade escolar", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 64, description: "Causar danos ao patrimônio da unidade escolar", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 65, description: "Causar ou contribuir para a ocorrência de acidentes de qualquer natureza", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 66, description: "Comunicar-se com outro aluno ou utilizar-se de qualquer meio não permitido durante qualquer instrumento de avaliação", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 67, description: "Denegrir o nome da EECM e/ou de qualquer de seus membros através de procedimentos desrespeitosos, seja por palavras, gestos, meio virtual ou outros", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 68, description: "Desrespeitar, desobedecer ou desafiar a Diretoria, coordenação, Oficial de gestão Educacional-Militar, o Oficial de Gestão Cívico-Militar, Monitores, professores ou servidores da unidade escolar", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 69, description: "Divulgar, ou concorrer para que isso aconteça, qualquer imagem ou matéria que induza a apologia às drogas, à violência e/ou pornografia", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 70, description: "Entrar na unidade escolar, ou dela se ausentar, sem autorização", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 71, description: "Extraviar documentos que estejam sob sua responsabilidade", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 72, description: "Faltar com a verdade e/ou utilizar-se do anonimato para a prática de qualquer falta disciplinar", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 73, description: "Fazer uso, portar, distribuir, estar sob ação ou induzir outrem ao uso de bebida alcoólica, entorpecentes, tóxicos ou produtos alucinógenos, no interior da EECM, em suas imediações estando ou não uniformizado", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 74, description: "Hastear ou arriar bandeiras e estandartes, sem autorização", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 75, description: "Instigar colegas a cometerem faltas disciplinares e/ou ações delituosas que comprometam o bom nome da EECM", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 76, description: "Manter contato físico com denotação libidinosa no ambiente da EECM ou fora dela", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 77, description: "Obter ou fazer uso de imagens, vídeos, áudios ou de qualquer tipo de publicação difamatória contra qualquer membro da Comunidade Escolar", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 78, description: "Ofender membros da Comunidade Escolar com a prática de Bullying e Cyberbullying", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 79, description: "Pichar ou causar qualquer poluição visual ou sonora dentro e nas proximidades da EECM", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 80, description: "Portar objetos que ameacem a segurança individual e/ou da coletividade, tais como faca, estilete, entro outros objetos perfurocortantes", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 81, description: "Praticar atos contrários ao culto e ao respeito aos símbolos nacionais", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 82, description: "Promover ou tomar parte de qualquer manifestação coletiva que venha a macular o nome da EECM e/ou que prejudique o bom andamento das aulas e/ou avaliações", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 83, description: "Promover trotes de qualquer natureza", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 84, description: "Promover, incitar ou envolver-se em rixa, inclusive luta corporal, dentro ou fora da EECM, estando ou não uniformizado", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 85, description: "Provocar ou tomar parte, uniformizado ou estando na EECM, em manifestações de natureza política", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 86, description: "Rasurar, violar ou alterar documentos ou o conteúdo dos mesmos", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 87, description: "Representar a EECM e/ou por ela tomar compromisso, sem estar para isso autorizado", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 88, description: "Ter em seu poder, introduzir, ler ou distribuir, dentro da EECM, cartazes, jornais ou publicações que atentem contra a disciplina e/ou o moral ou de cunho político-partidário", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 89, description: "Utilizar ou subtrair indevidamente objetos ou valores alheios", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 90, description: "Utilizar-se de processos fraudulentos na realização de trabalhos pedagógicos", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 91, description: "Utilizar-se indevidamente e/ou causar avaria e/ou destruição do patrimônio pertencente à EECM", severity: "Grave", points: -0.5, measure: "Suspensão" }
];

// Add dummy data for initial state
export const INITIAL_STUDENTS: Student[] = [
  { id: "S1", name: "Rafael Souza", class: "3º Ano C", shift: "Vespertino", points: 6.5 },
  { id: "S2", name: "Fernanda Castro", class: "2º Ano A", shift: "Vespertino", points: 8.0 },
  { id: "S3", name: "Pedro Santos", class: "8º Ano C", shift: "Matutino", points: 7.9 },
  { id: "S4", name: "Ana Costa", class: "9º Ano D", shift: "Matutino", points: 8.0 },
  { id: "S5", name: "Maria Oliveira", class: "7º Ano B", shift: "Vespertino", points: 7.7 },
  { id: "S6", name: "Bruno Andrade Tapajós", class: "1º A", shift: "Matutino", points: 8.0 }
];

export const INITIAL_OCCURRENCES: Occurrence[] = [
  { id: "O1", studentId: "S1", date: "2026-04-15", ruleCode: 26, registeredBy: "Prof. Marcos" },
  { id: "O2", studentId: "S1", date: "2026-04-16", ruleCode: 27, registeredBy: "Prof. Marcos" },
  { id: "O3", studentId: "S2", date: "2026-04-17", ruleCode: 25, registeredBy: "Prof. Julia" }
];

export const INITIAL_ACCIDENTS: Accident[] = [];
export const INITIAL_PRAISES: Praise[] = [];
