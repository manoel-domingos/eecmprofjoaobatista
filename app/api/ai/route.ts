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

// Mapeamento oficial de erros HTTP da API DeepSeek
// Fonte: https://api-docs.deepseek.com/quick_start/error_codes
const DEEPSEEK_ERRORS: Record<number, { label: string; cause: string; solution: string }> = {
  400: {
    label: 'Formato Inválido',
    cause: 'Corpo da requisição em formato inválido.',
    solution: 'Verifique o payload enviado à API.',
  },
  401: {
    label: 'Falha de Autenticação',
    cause: 'API Key incorreta ou ausente.',
    solution: 'Verifique a variável NVIDIA_API_KEY no painel de variáveis.',
  },
  402: {
    label: 'Saldo Insuficiente',
    cause: 'Créditos da conta NVIDIA esgotados.',
    solution: 'Adicione saldo em https://integrate.api.nvidia.com.',
  },
  422: {
    label: 'Parâmetros Inválidos',
    cause: 'Parâmetros fora do esperado (max_tokens, temperature, etc.).',
    solution: 'Revise os parâmetros enviados na requisição.',
  },
  429: {
    label: 'Rate Limit Atingido',
    cause: 'Muitas requisições em pouco tempo.',
    solution: 'Aguarde alguns segundos e tente novamente.',
  },
  500: {
    label: 'Erro no Servidor DeepSeek',
    cause: 'Falha interna nos servidores da NVIDIA/DeepSeek.',
    solution: 'Tente novamente em instantes. Se persistir, contate o suporte.',
  },
  503: {
    label: 'Servidor Sobrecarregado',
    cause: 'Alto tráfego nos servidores DeepSeek.',
    solution: 'Tente novamente após breve espera.',
  },
};

function deepseekErrorMessage(status: number, rawMessage: string): string {
  const known = DEEPSEEK_ERRORS[status];
  if (known) {
    return `[HTTP ${status}] ${known.label} — ${known.cause} | Solução: ${known.solution}`;
  }
  return `[HTTP ${status}] ${rawMessage}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.NVIDIA_API_KEY) {
    return new Response(
      JSON.stringify({ error: deepseekErrorMessage(401, 'NVIDIA_API_KEY não configurada.') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { type: string; payload: Record<string, any> };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: deepseekErrorMessage(400, 'JSON inválido no corpo da requisição.') }),
      { status: 400 }
    );
  }

  const { type, payload } = body;
  const cfg = CONFIGS[type];
  if (!cfg) {
    return new Response(
      JSON.stringify({ error: deepseekErrorMessage(422, `Tipo "${type}" não reconhecido.`) }),
      { status: 400 }
    );
  }

  const { system, user } = buildPrompts(type, payload);

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
        const httpStatus: number = err?.status ?? 500;
        const rawMsg: string = err?.message ?? 'Erro desconhecido.';
        const friendlyMsg = deepseekErrorMessage(httpStatus, rawMsg);
        console.error('[v0] DeepSeek API Error', httpStatus, rawMsg);
        // Envia o erro com status HTTP real para o cliente poder exibir no painel de logs
        send({ error: friendlyMsg, httpStatus, raw: rawMsg });
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
