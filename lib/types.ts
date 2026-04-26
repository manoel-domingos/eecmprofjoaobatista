export interface FieldOption {
  value: string;
  label: string;
}

export interface AILog {
  model: string;
  provider: 'google' | 'groq' | 'openai' | 'gemini';
  prompt: string;
  response: string;
  status: 'success' | 'error';
  timestamp?: number;
}
