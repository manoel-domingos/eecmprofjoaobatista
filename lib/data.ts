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
  { code: 1, description: "Apresentar-se com uniforme diferente do estabelecido pelo regulamento do uniforme; (uniforme, despadronizado)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 2, description: "Apresentar-se com barba ou bigode sem fazer; (barba, bigode, asseio)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 3, description: "Comparecer à EECM com cabelo em desalinho ou fora do padrão estabelecido pelas diretrizes dos Uniformes e do Regimento Escolar; (cabelo, penteado, corte)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 4, description: "Chegar atrasado a EECM para o início das aulas, instrução, treinamento, formatura ou atividade escolar; (atraso, pontualidade, chegar tarde)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 5, description: "Comparecer a EECM sem levar o material necessário; (material escolar, esquecimento, livro, caderno)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 6, description: "Adentrar ou permanecer em qualquer dependência da EECM, sem autorização; (lugar proibido, invasão, restrito)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 7, description: "Consumir alimentos, balas, doces líquidos ou mascar chicletes durante a aula, instrução, treinamento, formatura, atividade escolar, e nas dependências da EECM, salvo quando devidamente autorizado; (comer, chiclete, bala, lanche, refeitório)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 8, description: "Conversar ou se mexer quando estiver em forma; (conversar, mexer, formatura, ordem unida)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 9, description: "Deixar de entregar à Monitoria, Secretaria ou a Coordenação, qualquer objeto que não lhe pertença que tenha encontrado na EECM; (achados e perdidos, devolução)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 10, description: "Deixar de retribuir cumprimentos ou de prestar sinais de respeito regulamentares, previstos no Manual do Aluno; (cumprimento, continência, respeito, educação)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 11, description: "Deixar material escolar, objetos ou peças de uniforme em locais inapropriados dentro ou fora da unidade escolar; (esquecimento, bagunça, uniforme jogado)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 12, description: "Descartar papéis, restos de comida, embalagens ou qualquer objeto no chão ou fora de locais apropriados; (lixo, sujeira, poluição)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 13, description: "Dobrar qualquer peça de uniforme para diminuir seu tamanho, desfigurando sua originalidade; (uniforme, modificação, dobrar)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 14, description: "Debruçar-se sobre a carteira e/ou dormir durante o horário das aulas ou instruções; (dormir, debruçado, preguiça, desatenção)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 15, description: "Executar movimentos de ordem unida de forma displicente ou desatenciosa; (ordem unida, marcha, desatenção)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 16, description: "Fazer ou provocar excessivo barulho em qualquer dependência da EECM, durante o horário de aula; (barulho, gritaria, algazarra)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 17, description: "Não levar ao conhecimento de autoridade competente falta ou irregularidade que presenciar ou de que tiver ciência; (omissão, testemunha, irregularidade)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 18, description: "Perturbar o estudo do(s) colega(s), com ruídos ou brincadeiras; (bagunça, brincadeira, atrapalhar)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 19, description: "Utilizar-se, na sala, de qualquer publication estranha à sua atividade escolar, salvo quando autorizado; (livro estranho, revista, gibi, leitura não autorizada)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 20, description: "Retardar ou contribuir para o atraso da execução de qualquer atividade sem justo motivo; (atrasar, demora, lerdeza)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 21, description: "Sentar-se no chão, atentando contra a postura e compostura, estando uniformizado, exceto quando em aula de educação Física; (sentar no chão, postura, compostura)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 22, description: "Utilizar qualquer tipo de jogo, brinquedo, figurinhas, coleções no interior da EECM; (jogo, brinquedo, figurinha, coleção)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 23, description: "Usar, a aluna, piercing, anel e brinco fora do padrão estabelecido, mais de um brinco em cada orelha, alargador ou similares, quando uniformizado, durante a aula, instrução, treinamento, formatura ou atividade escolar, salvo por motivação religiosa e confessional, devidamente comprovado pela instituição religiosa a que pertence; (piercing, brinco, acessório, brinco extra)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 24, description: "Usar, o aluno, piercings, brinco, alargador ou similares, quando uniformizado, durante a aula, instrução, treinamento, formatura ou atividade escolar, salvo por motivação religiosa e confessional, devidamente comprovado pela instituição religiosa a que pertence; (piercing, brinco, alargador, acessório)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 25, description: "Usar, quando uniformizado, boné, capuz ou outros adornos, durante a atividade escolar; (boné, capuz, gorro, toca, adorno)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 26, description: "Ficar na sala de aula durante os intervalos e as formaturas diárias; (intervalo, recreio, ficar na sala)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },

  // FALTAS DISCIPLINARES DE NATUREZA MÉDIA (27-62) -1.00
  { code: 27, description: "Atrasar ou deixar de atender ao chamado da Diretoria, coordenação, Oficial de Gestão Educacional-Militar, o Oficial de Gestão Cívico-Militar, Monitores, professores ou servidores no exercício de sua função; (atendimento, chamado, desobediência)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 28, description: "Deixar de comparecer a qualquer atividade extraclasse para a qual tenha sido designado, exceto quando devidamente justificado; (extraclasse, evento, ausência)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 29, description: "Deixar de comparecer às atividades escolares, formaturas, ou delas se ausentar, sem autorização; (faltar, gazear, sair sem permissão)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 30, description: "Deixar de cumprir ou esquivar-se de medidas disciplinares impostas pelo Gestor Educacional-Militar e Gestor Cívico Militar; (medida disciplinar, TAC, punição)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 31, description: "Deixar de devolver à EECM, dentro do prazo estipulado, documentos devidamente assinados pelo seu responsável; (documento, assinatura, prazo, devolução)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 32, description: "Deixar de devolver, no prazo fixado, livros da biblioteca ou outros materiais pertencentes às EECM; (biblioteca, livro, atraso na devolução)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 33, description: "Deixar de entregar ao pai ou responsável, documento que lhe foi encaminhado pela EECM; (comunicação, pais, esconder documento)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 34, description: "Deixar de executar tarefas atribuídas da Diretoria, coordenação, Oficial de Gestão Educacional-Militar, o Oficial de Gestão Cívico-Militar, Monitores, professores ou servidores no exercício de sua função; (tarefa, devolução, desobediência)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 35, description: "Deixar de zelar por sua apresentação pessoal; (apresentação pessoal, higiene, asseio)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 36, description: "Dirigir memoriais ou petições a qualquer autoridade, sobre assuntos da alçada da Diretoria e do Oficial de Gestão Educacional-Militar; (petição, autoridade, hierarquia)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 37, description: "Entrar ou sair da EECM por locais não permitidos; (local proibido, pular muro, portão errado)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 38, description: "Espalhar boatos ou notícias tendenciosas por qualquer meio; (fofoca, boato, notícia falsa, fake news)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 39, description: "Tocar a sirene, sem ordem para tal; (sirene, sinal, brincadeira)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 40, description: "Fumar dentro ou nas imediações da EECM ou quando uniformizado; (fumar, cigarro, fumo, vaper, eletrônico)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 41, description: "Ingressar ou sair da EECM sem estar com o uniforme regulamentar, bem como trocar de roupa (trajes civis) dentro da EECM ou em suas imediações; (uniforme, troca de roupa, paisana)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 42, description: "Ler ou distribuir, dentro da EECM, publicações estampas ou jornais que atentem contra a disciplina, a moral e a ordem pública; (panfleto, jornal, moral)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 43, description: "Manter contato físico que denote envolvimento de cunho amoroso (namoro, beijos, etc.) quando devidamente uniformizado, dentro da EECM ou fora dele; (namoro, beijo, amasso, contato físico)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 44, description: "Não zelar pelo nome da Instituição que representa, deixando de portar-se adequadamente em qualquer ambiente, quando uniformizado ou em atividades relacionadas a EECM; (comportamento externo, nome da escola)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 45, description: "Negar-se a colaborar ou participar nos eventos, formaturas, solenidades e desfiles oficiais da EECM; (recusa, desfile, formatura, evento)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 46, description: "Ofender o moral de colegas ou de qualquer membro da Comunidade Escolar por atos, gestos ou palavras; (ofensa, xingamento, gesto obsceno)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 47, description: "Portar-se de forma inconveniente em sala de aula ou outro local de instrução/recreação, bem como transportes de uso coletivo; (inconveniente, mau comportamento, ônibus)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 48, description: "Portar-se de maneira desrespeitosa ou inconveniente nos eventos sociais ou esportivos, promovidos ou com a participação da EECM ou fora dela; (evento, esporte, desrespeito)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 49, description: "Proferir palavras de baixo calão, incompatíveis com as normas da boa educação, ou grafálas em qualquer lugar; (palavrão, xingamento, pichação de nome)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 50, description: "Propor ou aceitar transação pecuniária de qualquer natureza, no interior da EECM, sem a devida autorização; (venda, dinheiro, comércio, transação)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 51, description: "Provocar ou disseminar a discórdia entre colegas; (intriga, fofoca, discórdia)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 52, description: "Publicar ou contribuir para que sejam publicadas mensagens, fotos, vídeos ou qualquer outro documento, na Internet ou qualquer outro meio de comunicação, que possam expor qualquer integrante da EECM; (internet, exposição, vídeo, foto, rede social)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 53, description: "Retirar ou tentar retirar objeto, de qualquer dependência da EECM, ou mesmo deles servir-se, sem ordem do responsável e/ou do proprietário; (pegar objeto, uso não autorizado)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 54, description: "Sair de forma sem autorização; (formatura, sair de forma, debandar)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 55, description: "Sair, entrar ou permanecer na sala de aula sem permissão; (sala de aula, sem permissão, sair da sala)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 56, description: "Ser retirado, por mau comportamento, de sala de aula ou qualquer ambiente em que esteja sendo realizada atividade; (expulso da sala, mau comportamento)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 57, description: "Simular doenças para esquivar-se ao atendimento de obrigações e de atividades escolares; (fingir doença, gazear, simulação)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 58, description: "Tomar parte em jogos de azar ou em apostas na unidade escolar ou fora dela, uniformizados ou não; (aposta, jogo de azar, baralho, dados)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 59, description: "Usar as instalações ou equipamentos esportivos do EECM, sem uniformes adequados, ou sem autorização; (esporte, quadra, uniforme de ed. física)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 60, description: "Usar o uniforme ou o nome do EECM em ambiente inapropriado; (uniforme, ambiente adequado, festa, local impróprio)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 61, description: "Utilizar, sem autorização, telefones celulares ou quaisquer aparelhos eletrônicos ou não, durante as atividades escolares; (celular, telefone, smartphone, fone de ouvido)", severity: "Media", points: -1.0, measure: "Repreensão" },
  { code: 62, description: "Usar indevidamente distintivos ou insígnias; (distintivo, insígnia, patente, medalha)", severity: "Media", points: -1.0, measure: "Repreensão" },

  // FALTAS DISCIPLINARES DE NATUREZA GRAVE (63-91) -0.50
  { code: 63, description: "Assinar pelo responsável, documento que deve ser entregue à unidade escolar; (falsificação, assinatura, fraude)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 64, description: "Causar danos ao patrimônio da unidade escolar; (vandalismo, quebrar, danificar, patrimônio)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 65, description: "Causar ou contribuir para a ocorrência de acidentes de qualquer natureza; (acidente, perigo, imprudência)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 66, description: "Comunicar-se com outro aluno ou utilizar-se de qualquer meio não permitido durante qualquer instrumento de avaliação; (cola, fraude, prova, avaliação)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 67, description: "Denegrir o nome da EECM e/ou de qualquer de seus membros através de procedimentos desrespeitosos, seja por palavras, gestos, meio virtual ou outros; (difamação, calúnia, desrespeito)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 68, description: "Desrespeitar, desobedecer ou desafiar a Diretoria, coordenação, Oficial de gestão Educacional-Militar, o Oficial de Gestão Cívico-Militar, Monitores, professores ou servidores da unidade escolar; (desobediência, desacato, afronta)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 69, description: "Divulgar, ou concorrer para que isso aconteça, qualquer imagem ou matéria que induza a apologia às drogas, à violência e/ou pornografia; (apologia, drogas, pornografia, violência)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 70, description: "Entrar na unidade escolar, ou dela se ausentar, sem autorização; (fugir da escola, entrar escondido, gazear)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 71, description: "Extraviar documentos que estejam sob sua responsabilidade; (perder documento, sumiço)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 72, description: "Faltar com a verdade e/ou utilizar-se do anonimato para a prática de qualquer falta disciplinar; (mentira, anonimato, falsidade)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 73, description: "Fazer uso, portar, distribuir, estar sob ação ou induzir outrem ao uso de bebida alcoólica, entorpecentes, tóxicos ou produtos alucinógenos, no interior da EECM, em suas imediações estando ou não uniformizado; (bebida, droga, entorpecente, álcool, fumo)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 74, description: "Hastear ou arriar bandeiras e estandartes, sem autorização; (bandeira, hasteamento, sinal)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 75, description: "Instigar colegas a cometerem faltas disciplinares e/ou ações delituosas que comprometam o bom nome da EECM; (incitação, mau exemplo)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 76, description: "Manter contato físico com denotação libidinosa no ambiente da EECM ouf ora dela; (contato libidinoso, assédio, ato obsceno)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 77, description: "Obter ou fazer uso de imagens, vídeos, áudios ou de qualquer tipo de publicação difamatória contra qualquer membro da Comunidade Escolar; (difamação, bullying, exposição)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 78, description: "Ofender membros da Comunidade Escolar com a prática de Bullying e Cyberbullying; (bullying, cyberbullying, agressão verbal)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 79, description: "Pichar ou causar qualquer poluição visual ou sonora dentro e nas proximidades da EECM; (pichação, sujeira, poluição)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 80, description: "Portar objetos que ameacem a segurança individual e/ou da coletividade, tais como faca, estilete, entro outros objetos perfurocortantes; (faca, estilete, arma, perigo)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 81, description: "Praticar atos contrários ao culto e ao respeito aos símbolos nacionais; (símbolos nacionais, hino, bandeira, desrespeito)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 82, description: "Promover ou tomar parte de qualquer manifestação coletiva que venha a macular o nome da EECM e/ou que prejudique o bom andamento das aulas e/ou avaliações; (manifestação, protesto, greve)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 83, description: "Promover trotes de qualquer natureza; (trote, brincadeira pesada)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 84, description: "Promover, incitar ou envolver-se em rixa, inclusive luta corporal, dentro ou fora da EECM, estando ou não uniformizado; (briga, luta, agressão, rixa)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 85, description: "Provocar ou tomar parte, uniformizado ou estando na EECM, em manifestações de natureza política; (política, manifestação, partido)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 86, description: "Rasurar, violar ou alterar documentos ou o conteúdo dos mesmos; (rasura, alteração, falsificação)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 87, description: "Representar a EECM e/ou por ela tomar compromisso, sem estar para isso autorizado; (falsidade, representação indevida)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 88, description: "Ter em seu poder, introduzir, ler ou distribuir, dentro da EECM, cartazes, jornais ou publicações que atentem contra a disciplina e/ou o moral ou de cunho político-partidário; (cartaz, política, moral, subversão)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 89, description: "Utilizar ou subtrair indevidamente objetos ou valores alheios; (roubo, furto, subtrair, pegar)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 90, description: "Utilizar-se de processos fraudulentos na realização de trabalhos pedagógicos; (plágio, fraude, cópia, trabalho)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 91, description: "Utilizar-se indevidamente e/ou causar avaria e/ou destruição do patrimônio pertencente à EECM; (destruição, quebrar, vandalismo, patrimônio)", severity: "Grave", points: -0.5, measure: "Suspensão" }
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
