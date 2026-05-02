import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const CONFIGS: Record<string, { maxTokens: number; temperature: number }> = {
  ata:      { maxTokens: 400, temperature: 0.4 },
  analise:  { maxTokens: 500, temperature: 0.5 },
  relatorio:{ maxTokens: 600, temperature: 0.4 },
  chat:     { maxTokens: 250, temperature: 0.5 },
};

export async function POST(req: NextRequest) {
  try {
    const { type, payload } = await req.json();

    if (!process.env.NVIDIA_API_KEY) {
      return NextResponse.json({ error: 'NVIDIA_API_KEY não configurada.' }, { status: 500 });
    }

    const cfg = CONFIGS[type];
    if (!cfg) return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 });

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'ata': {
        systemPrompt = 'Gestor escolar. Redija atas disciplinares formais e objetivas. Retorne APENAS o texto da ata.';
        userPrompt = `Formalize para ata:
Aluno(s): ${payload.students}
Infração: ${payload.infractions}
Data/Hora: ${payload.dateTime} | Local: ${payload.location}
Relato: ${payload.text || 'Crie modelo padrão baseado na infração.'}`;
        break;
      }

      case 'analise': {
        systemPrompt = 'Psicopedagogo escolar. Analise histórico disciplinar de forma construtiva e profissional.';
        userPrompt = `Aluno: ${payload.studentName} | Turma: ${payload.class}
Ocorrências: ${payload.totalOccurrences} | Pontos: ${payload.currentPoints}
Detalhes: ${payload.occurrences}
Forneça: padrão de comportamento, causas prováveis e 3 recomendações práticas.`;
        break;
      }

      case 'relatorio': {
        systemPrompt = 'Especialista em gestão educacional. Gere relatórios disciplinares concisos com insights acionáveis.';
        userPrompt = `Período: ${payload.period} | Total ocorrências: ${payload.totalOccurrences}
Alunos envolvidos: ${payload.studentsWithOccurrences}
Top infrações: ${payload.topInfractions}
Top turmas: ${payload.topClasses}
Gravidade: ${payload.severityDistribution}
Gere: resumo executivo, tendências e recomendações prioritárias.`;
        break;
      }

      case 'chat': {
        systemPrompt = 'Você é ARIA, assistente virtual da E.E. Cívico-Militar Prof. João Batista. Responda de forma curta, direta e cordial em português. Auxilie com regras disciplinares, registro de ocorrências e orientações pedagógicas.';
        userPrompt = payload.message;
        break;
      }
    }

    const completion = await client.chat.completions.create({
      model: 'deepseek-ai/deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: cfg.temperature,
      max_tokens: cfg.maxTokens,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ result: text });

  } catch (error: any) {
    console.error('[AI API Error]', error?.status, error?.message);
    return NextResponse.json(
      { error: error?.message || 'Erro interno na IA.' },
      { status: error?.status || 500 }
    );
  }
}
