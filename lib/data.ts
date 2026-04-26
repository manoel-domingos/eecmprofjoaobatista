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
  durationDays?: number;
  measure?: string;
  attenuatingFactors?: string[];
  aggravatingFactors?: string[];
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
  { code: 19, description: "Utilizar-se, na sala, de qualquer publicação estranha à sua atividade escolar, salvo quando autorizado; (livro estranho, revista, gibi, leitura não autorizada)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 20, description: "Retardar ou contribuir para o atraso da execução de qualquer atividade sem justo motivo; (atrasar, demora, lerdeza)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 21, description: "Sentar-se no chão, atentando contra a postura e compostura, estando uniformizado, exceto quando em aula de educação Física; (sentar no chão, postura, compostura)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 22, description: "Utilizar qualquer tipo de jogo, brinquedo, figurinhas, coleções no interior da EECM; (jogo, brinquedo, figurinha, coleção)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 23, description: "Usar, a aluna, piercing, anel e brinco fora do padrão estabelecido, mais de um brinco em cada orelha, alargador ou similares, quando uniformizada; (piercing, brinco, acessório, brinco extra)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 24, description: "Usar, o aluno, piercings, brinco, alargador ou similares, quando uniformizado; (piercing, brinco, alargador, acessório)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 25, description: "Usar, quando uniformizado, boné, capuz ou outros adornos, durante a atividade escolar; (boné, capuz, gorro, toca, adorno)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },
  { code: 26, description: "Ficar na sala de aula durante os intervalos e as formaturas diárias; (intervalo, recreio, ficar na sala)", severity: "Leve", points: -0.1, measure: "Advertência Oral" },

  // FALTAS DISCIPLINARES DE NATUREZA MÉDIA (27-62) -0.30
  { code: 27, description: "Ausentar-se da sala de aula, instrução ou de qualquer atividade escolar, sem a devida autorização; (fugir da aula, sair sem permissão, gazear)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 28, description: "Apresentar-se à Monitoria, Coordenação ou a Secretaria para tratar de assunto de interesse particular sem a devida autorização; (assunto pessoal, sem autorização)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 29, description: "Atribuir-se a qualidade de representante da EECM, sem estar devidamente autorizado; (falsidade, representação indevida)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 30, description: "Brincar de lutas, dar apelidos a colegas, professores ou funcionários da escola e rir de maneira excessiva em local e momento impróprio; (apelido, bullying, brincadeira de mão, luta)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 31, description: "Cantar, assobiar ou fazer ruído em local e momento impróprio; (barulho, canto, assobio)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 32, description: "Conduzir veículo motorizado nas dependências da EECM e em seu entorno, quando uniformizado; (moto, carro, dirigir, pilotar)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 33, description: "Deixar de cumprir ordem recebida, referente a normas e regulamentos da EECM; (desobediência, insubordinação)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 34, description: "Demonstrar falta de posturas militares em local público, estando uniformizado; (postura, comportamento, militarismo)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 35, description: "Desrespeitar as normas de segurança da EECM; (segurança, perigo, norma)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 36, description: "Entrar ou sair da EECM por locais não permitidos; (pular muro, saída não autorizada)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 37, description: "Estar o aluno, em local ou dependência da EECM, cujo acesso lhe seja vedado; (área restrita, proibido)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 38, description: "Faltar com a verdade; (mentira, enganação)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 39, description: "Fazer desenhos ou escrever em locais não apropriados; (pichação, rabisco, estragar patrimônio)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 40, description: "Induzir outrem a erro ou falta; (induzir ao erro, influência negativa)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 41, description: "Não portar o Guia do Aluno ou outro documento de identificação, quando solicitado por autoridade competente; (carteirinha, identificação, guia)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 42, description: "Permanecer uniformizado em locais incompatíveis com a condição de aluno da EECM; (local impróprio, uniforme fora da escola)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 43, description: "Permitir que outro aluno utilize seu material ou peças de uniforme, sem autorização; (emprestar uniforme, material)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 44, description: "Praticar atos de vandalismo ou danos ao patrimônio da EECM ou de terceiros; (vandalismo, quebrar, danificar)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 45, description: "Realizar transações comerciais de qualquer natureza dentro da EECM; (venda, comércio, negócio)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 46, description: "Recusar-se a receber material escolar, uniforme ou outro objeto distribuído pela EECM; (recusa, desobediência)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 47, description: "Retirar-se da EECM, sem autorização; (sair sem permissão, fugir)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 48, description: "Sobrepor ao uniforme qualquer peça que não pertença ao mesmo; (agasalho estranho, acessório não permitido)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 49, description: "Ter em seu poder, objetos ou publicações que atentem contra a moral e os bons costumes; (pornografia, impróprio)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 50, description: "Tomar parte em jogos de azar; (aposta, jogo proibido)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 51, description: "Trazer para a EECM objetos de valor ou eletroeletrônicos sem autorização; (eletrônico, valor, proibido)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 52, description: "Usar o uniforme de forma incorreta ou desleixada; (desleixo, uniforme mal posto)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 53, description: "Utilizar-se de meios ilícitos em avaliações ou trabalhos escolares; (cola, plágio, trapaça)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 54, description: "Utilizar-se de telefone celular ou outros aparelhos eletrônicos durante a aula, sem autorização do professor; (celular, telefone, eletrônico)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 55, description: "Agir com desatenção ou falta de interesse durante a aula, instrução ou atividade escolar; (desatenção, preguiça)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 56, description: "Comparecer à EECM sem estar devidamente asseado; (higiene, asseio, sujeira)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 57, description: "Fazer uso de maquiagem excessiva, esmalte de cor não permitida ou outros adornos, quando uniformizado; (maquiagem, esmalte, adorno)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 58, description: "Manter contato físico que denote relacionamento amoroso (beijos, abraços, mãos dadas, etc.), estando uniformizado; (namoro, beijo, contato físico)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 59, description: "Omitir-se de prestar auxílio a colega, quando necessário e possível; (omissão, falta de companheirismo)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 60, description: "Proferir palavras de baixo calão; (palavrão, xingamento, baixo calão)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 61, description: "Sentar-se em locais não destinados a esse fim, como mesas, corrimãos, parapeitos, etc.; (sentar em lugar errado, postura)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },
  { code: 62, description: "Usar de gírias ao se dirigir a professores, militares ou funcionários; (gíria, falta de respeito, formalidade)", severity: "Media", points: -0.3, measure: "Repreensão / Advertência Escrita" },

  // FALTAS DISCIPLINARES DE NATUREZA GRAVE (63-91) -0.50 por dia
  { code: 63, description: "Agredir física ou moralmente qualquer pessoa no interior da EECM ou em seu entorno; (agressão, briga, soco, tapa, insulto)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 64, description: "Ameaçar ou intimidar qualquer pessoa; (ameaça, intimidação, medo)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 65, description: "Apresentar-se sob efeito de substâncias entorpecentes ou bebidas alcoólicas; (droga, álcool, bêbado)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 66, description: "Atentar contra a dignidade ou o pudor de qualquer pessoa; (assédio, atentado ao pudor, moral)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 67, description: "Cometer atos de preconceito ou discriminação de qualquer natureza; (racismo, homofobia, preconceito, discriminação)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 68, description: "Desacatar ou desrespeitar professores, militares ou funcionários da EECM; (desacato, desrespeito, autoridade)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 69, description: "Desviar ou subtrair para si ou para outrem, coisa alheia móvel; (furto, roubo, subtrair)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 70, description: "Difundir notícias falsas que possam comprometer a imagem da EECM ou de seus integrantes; (fake news, fofoca, mentira grave)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 71, description: "Dirigir-se a superiores ou autoridades de forma desrespeitosa ou insolente; (insolência, falta de respeito, superior)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 72, description: "Fazer uso, portar ou distribuir substâncias entorpecentes ou bebidas alcoólicas; (tráfico, usar droga, álcool)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 73, description: "Incentivar ou participar de movimentos de indisciplina coletiva; (motim, revolta, indisciplina coletiva)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 74, description: "Incitar ou participar de brigas ou agressões físicas; (briga, luta, confusão)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 75, description: "Manifestar-se de forma desrespeitosa contra símbolos nacionais ou da EECM; (bandeira, hino, símbolos, desrespeito)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 76, description: "Portar armas de qualquer natureza ou objetos que possam causar dano físico; (arma, faca, estilete, perigo)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 77, description: "Praticar atos libidinosos no interior da EECM ou em seu entorno; (sexo, ato libidinoso, imoralidade)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 78, description: "Praticar bullying ou cyberbullying contra colegas, professores ou funcionários; (bullying, cyberbullying, perseguição)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 79, description: "Praticar furto ou roubo; (furto, roubo, assalto)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 80, description: "Produzir ou divulgar imagens ou vídeos que atentem contra a honra da EECM ou de seus integrantes; (exposição indevida, vídeo difamatório)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 81, description: "Promover ou participar de jogos de azar com apostas em dinheiro; (aposta, jogo de azar, dinheiro)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 82, description: "Recusar-se a identificar-se quando solicitado por autoridade competente; (recusa de identificação, anonimato)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 83, description: "Usar de violência ou grave ameaça para obter qualquer vantagem; (extorsão, coação, violência)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 84, description: "Utilizar-se de documentos falsos ou adulterados; (falsificação, documento falso)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 85, description: "Vandalizar o patrimônio público ou privado; (vandalismo, depredação)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 86, description: "Praticar atos que caracterizem crime ou contravenção penal; (crime, contravenção, polícia)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 87, description: "Assediar sexualmente qualquer pessoa; (assédio sexual, importunação)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 88, description: "Fazer apologia ao crime ou a organizações criminosas; (apologia ao crime, facção)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 89, description: "Introduzir ou distribuir na EECM material inflamável ou explosivo, sem autorização; (fogo, explosivo, perigo grave)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 90, description: "Praticar atos de crueldade contra animais; (maus tratos, animais, crueldade)", severity: "Grave", points: -0.5, measure: "Suspensão" },
  { code: 91, description: "Utilizar-se da condição de aluno da EECM para obter vantagens ilícitas; (tirar vantagem, corrupção, influência)", severity: "Grave", points: -0.5, measure: "Suspensão" }
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
