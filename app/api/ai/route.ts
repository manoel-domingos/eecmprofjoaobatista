import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const CONFIGS: Record<string, { maxTokens: number; temperature: number }> = {
  ata:       { maxTokens: 400, temperature: 0.4 },
  analise:   { maxTokens: 500, temperature: 0.5 },
  relatorio: { maxTokens: 600, temperature: 0.4 },
  chat:      { maxTokens: 250, temperature: 0.5 },
};

function buildPrompts(type: string, payload: Record<string, any>): { system: string; user: string } {
  switch (type) {
    case 'ata':
      return {
        system: 'Gestor escolar. Redija atas disciplinares formais e objetivas. Retorne APENAS o texto da ata.',
        user: `Formalize para ata:\nAluno(s): ${payload.students}\nInfração: ${payload.infractions}\nData/Hora: ${payload.dateTime} | Local: ${payload.location}\nRelato: ${payload.text || 'Crie modelo padrão baseado na infração.'}`,
      };
    case 'analise':
      return {
        system: 'Psicopedagogo escolar. Analise histórico disciplinar de forma construtiva e profissional.',
        user: `Aluno: ${payload.studentName} | Turma: ${payload.class}\nOcorrências: ${payload.totalOccurrences} | Pontos: ${payload.currentPoints}\nDetalhes: ${payload.occurrences}\nForneça: padrão de comportamento, causas prováveis e 3 recomendações práticas.`,
      };
    case 'relatorio':
      return {
        system: 'Especialista em gestão educacional. Gere relatórios disciplinares concisos com insights acionáveis.',
        user: `Período: ${payload.period} | Total ocorrências: ${payload.totalOccurrences}\nAlunos envolvidos: ${payload.studentsWithOccurrences}\nTop infrações: ${payload.topInfractions}\nTop turmas: ${payload.topClasses}\nGravidade: ${payload.severityDistribution}\nGere: resumo executivo, tendências e recomendações prioritárias.`,
      };
    case 'chat':
      return {
        system: 'Você é ARIA, assistente virtual da E.E. Cívico-Militar Prof. João Batista. Responda de forma curta, direta e cordial em português. Auxilie com regras disciplinares, registro de ocorrências e orientações pedagógicas.',
        user: payload.message,
      };
    default:
      return { system: '', user: '' };
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.NVIDIA_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'NVIDIA_API_KEY não configurada.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { type: string; payload: Record<string, any> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), { status: 400 });
  }

  const { type, payload } = body;
  const cfg = CONFIGS[type];
  if (!cfg) {
    return new Response(JSON.stringify({ error: 'Tipo inválido.' }), { status: 400 });
  }

  const { system, user } = buildPrompts(type, payload);

  // Stream SSE para o cliente
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const completion = await client.chat.completions.create({
          model: 'deepseek-ai/deepseek-v4-flash',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: cfg.temperature,
          max_tokens: cfg.maxTokens,
          stream: true,
        });

        let full = '';
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            full += delta;
            send({ delta });
          }
        }
        send({ done: true, result: full.trim() });
      } catch (err: any) {
        console.error('[AI API Error]', err?.status, err?.message);
        send({ error: err?.message || 'Erro interno na IA.' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
