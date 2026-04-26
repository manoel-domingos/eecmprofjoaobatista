import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODELS = [
  "gemini-2.0-flash-lite", 
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

export const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768"
];

export const MODEL_FALLBACK_CHAIN = [...GROQ_MODELS, ...GEMINI_MODELS];

export interface AILog {
  id: string;
  timestamp: string;
  model: string;
  prompt: string;
  response: string;
  tokens?: number;
  status: 'success' | 'error';
  error?: string;
  provider: 'google' | 'groq';
}

export const globalAILogs: AILog[] = [];
let onLogUpdate: ((logs: AILog[]) => void) | null = null;

export function subscribeToAILogs(callback: (logs: AILog[]) => void) {
  onLogUpdate = callback;
  return () => { onLogUpdate = null; };
}

function addLog(log: Omit<AILog, 'id' | 'timestamp'>) {
  const newLog: AILog = {
    ...log,
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toLocaleTimeString(),
  };
  globalAILogs.unshift(newLog);
  if (globalAILogs.length > 50) globalAILogs.pop();
  if (onLogUpdate) onLogUpdate([...globalAILogs]);
}

/**
 * Executes a generative content request with automatic provider/model rotation.
 */
export async function generateContentWithFallback(
  apiKey: string, // Can be Gemini key or Groq key depending on flow
  prompt: string,
  onProgress?: (modelName: string) => void,
  groqKey?: string
) {
  let lastError: any = null;

  // 1. Try Groq first if key is available (it's faster)
  if (groqKey) {
    for (const modelName of GROQ_MODELS) {
      try {
        if (onProgress) onProgress(`Groq: ${modelName}`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1
          })
        });

        if (!response.ok) throw new Error(`Groq error: ${response.status}`);
        
        const data = await response.json();
        const responseText = data.choices[0].message.content;
        
        addLog({
          model: modelName,
          prompt,
          response: responseText,
          tokens: data.usage?.total_tokens || Math.ceil((prompt.length + responseText.length) / 4),
          status: 'success',
          provider: 'groq'
        });

        return { response: { text: () => responseText } };
      } catch (err: any) {
        lastError = err;
        addLog({ model: modelName, prompt, response: '', status: 'error', error: err.message, provider: 'groq' });
        continue;
      }
    }
  }

  // 2. Fallback to Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  for (const modelName of GEMINI_MODELS) {
    try {
      if (onProgress) onProgress(`Gemini: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      addLog({
        model: modelName,
        prompt,
        response: responseText,
        tokens: Math.ceil((prompt.length + responseText.length) / 4),
        status: 'success',
        provider: 'google'
      });
      
      return result;
    } catch (err: any) {
      lastError = err;
      addLog({ model: modelName, prompt, response: '', status: 'error', error: err.message, provider: 'google' });
      continue;
    }
  }

  const isFinalQuotaError = lastError?.message?.includes('429') || 
                          lastError?.message?.includes('quota') || 
                          lastError?.message?.includes('RESOURCE_EXHAUSTED');

  const errorMessage = isFinalQuotaError 
    ? "Cota de IA esgotada em todos os provedores (Groq/Google). Aguarde um momento."
    : (lastError?.message || "Todos os modelos falharam.");

  throw new Error(errorMessage);
}

/**
 * Returns the first available working model from the fallback chain.
 * Useful for chat or complex interactions.
 */
export async function getWorkingModelWithFallback(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const probePrompt = 'ok';
      // Probe
      const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: probePrompt }] }] });
      
      addLog({
        model: modelName,
        prompt: `[Probe] ${probePrompt}`,
        response: result.response.text(),
        status: 'success'
      });

      return model;
    } catch (err: any) {
      const msg = err?.message || '';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isNotFound = msg.includes('404') || msg.includes('not found');
      
      addLog({
        model: modelName,
        prompt: '[Probe] ok',
        response: '',
        status: 'error',
        error: msg
      });

      lastError = err;
      if (isQuota || isNotFound) continue;
      throw err;
    }
  }
  throw lastError || new Error("No working models available.");
}
