import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60; // segundos — necessario para modelos DeepSeek com alta latencia

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req: NextRequest) {
  try {
    const { type, payload } = await req.json();

    if (!process.env.NVIDIA_API_KEY) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY não configurada.' }, { status: 500 });
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'ata': {
        systemPrompt = `Você é um gestor escolar profissional especializado em registros disciplinares.
Seu papel é redigir atas disciplinares formais, claras, objetivas e imparciais.
Sempre use linguagem formal, terceira pessoa e seja preciso nos fatos.
Retorne APENAS o texto da ata, sem títulos, introduções ou explicações.`;

        userPrompt = `Melhore e formalize o seguinte relato de ocorrência disciplinar para uma ata oficial.

DADOS:
- Aluno(s): ${payload.students || 'Não identificado'}
- Infração(ões): ${payload.infractions || 'Não especificada'}
- Data/Hora: ${payload.dateTime || 'Não informada'}
- Local: ${payload.location || 'Não informado'}
- Relato original: ${payload.text || '(não fornecido, crie um modelo padrão baseado na infração)'}

Retorne APENAS o texto da ata melhorada.`;
        break;
      }

      case 'analise': {
        systemPrompt = `Você é um psicopedagogo e especialista em comportamento escolar.
Analise históricos disciplinares de forma empática, construtiva e profissional.
Identifique padrões, sugira intervenções e forneça recomendações práticas.
Use linguagem acessível para gestores escolares.`;

        userPrompt = `Analise o histórico disciplinar deste aluno e forneça uma análise comportamental completa.

ALUNO: ${payload.studentName}
TURMA: ${payload.class || 'Não informada'}
TOTAL DE OCORRÊNCIAS: ${payload.totalOccurrences}
PONTUAÇÃO ATUAL: ${payload.currentPoints}

OCORRÊNCIAS:
${payload.occurrences}

Forneça:
1. Análise do padrão de comportamento
2. Possíveis causas
3. Recomendações de intervenção
4. Ações prioritárias para a gestão escolar`;
        break;
      }

      case 'relatorio': {
        systemPrompt = `Você é um especialista em gestão educacional e análise de dados escolares.
Gere relatórios claros, objetivos e com insights acionáveis.
Use dados numéricos quando disponíveis e forneça conclusões práticas.`;

        userPrompt = `Gere um relatório disciplinar completo com base nos seguintes dados:

PERÍODO: ${payload.period || 'Geral'}
TOTAL DE OCORRÊNCIAS: ${payload.totalOccurrences}
ALUNOS COM OCORRÊNCIAS: ${payload.studentsWithOccurrences}
INFRAÇÕES MAIS COMUNS: ${payload.topInfractions}
TURMAS COM MAIS OCORRÊNCIAS: ${payload.topClasses}
DISTRIBUIÇÃO POR GRAVIDADE: ${payload.severityDistribution}
DADOS ADICIONAIS: ${payload.extra || 'Nenhum'}

Forneça um relatório com: resumo executivo, análise de tendências, turmas/alunos de atenção e recomendações.`;
        break;
      }

      case 'chat': {
        systemPrompt = `Você é o assistente virtual da E.E. Cívico-Militar Prof. João Batista.
Seu nome é "ARIA" (Assistente de Registros e Informações da Escola).
Você auxilia gestores, professores e monitores com dúvidas sobre:
- Regras disciplinares e artigos do regimento interno
- Procedimentos de registro de ocorrências
- Orientações pedagógicas e comportamentais
- Informações sobre o sistema

Seja cordial, objetivo e profissional. Responda sempre em português brasileiro.
Quando não souber algo específico da escola, oriente o usuário a consultar a coordenação.`;

        userPrompt = payload.message;
        break;
      }

      default:
        return NextResponse.json({ error: 'Tipo de requisição inválido.' }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: 'deepseek-ai/deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('[AI API Error]', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno na IA.' },
      { status: 500 }
    );
  }
}
