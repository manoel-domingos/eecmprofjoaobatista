import { GoogleGenerativeAI } from "@google/generative-ai";

export const MODEL_FALLBACK_CHAIN = [
  "gemini-2.0-flash-lite", 
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

export interface AILog {
  id: string;
  timestamp: string;
  model: string;
  prompt: string;
  response: string;
  tokens?: number;
  status: 'success' | 'error';
  error?: string;
}

// Global debug state (singleton)
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
 * Executes a generative content request with automatic model rotation/fallback.
 * @param apiKey The Gemini API Key
 * @param prompt The prompt to send
 * @param options Optional model selection options
 */
export async function generateContentWithFallback(
  apiKey: string,
  prompt: string,
  onProgress?: (modelName: string) => void
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      if (onProgress) onProgress(modelName);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      
      const responseText = result.response.text();
      addLog({
        model: modelName,
        prompt,
        response: responseText,
        tokens: Math.ceil((prompt.length + responseText.length) / 4), // Rough estimate
        status: 'success'
      });
      
      return result;
    } catch (err: any) {
      const msg = err?.message || '';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isNotFound = msg.includes('404') || msg.includes('not found');
      
      addLog({
        model: modelName,
        prompt,
        response: '',
        status: 'error',
        error: msg
      });

      lastError = err;
      
      if (isQuota || isNotFound) {
        console.warn(`Model ${modelName} failed, trying next in fallback chain...`);
        continue;
      }
      throw err;
    }
  }

  const isFinalQuotaError = lastError?.message?.includes('429') || 
                          lastError?.message?.includes('quota') || 
                          lastError?.message?.includes('RESOURCE_EXHAUSTED');

  const errorMessage = isFinalQuotaError 
    ? "Cota de IA esgotada em todos os modelos disponíveis. Por favor, aguarde um momento ou tente novamente mais tarde."
    : (lastError?.message || "Todos os modelos no sistema de rodízio falharam.");

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
