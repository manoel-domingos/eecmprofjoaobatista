import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Server-side AI chat - keeps API key secure
export async function POST(request: NextRequest) {
  try {
    const { prompt, context, maxTokens = 1024 } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = context 
      ? `Contexto do sistema escolar:\n${context}\n\nInstrução do usuário:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: systemPrompt,
      config: {
        maxOutputTokens: maxTokens,
      }
    });

    const responseText = response.text || '';
    
    return NextResponse.json({ 
      success: true, 
      data: responseText 
    });
  } catch (err) {
    console.error("AI Chat failed:", err);
    return NextResponse.json(
      { error: 'AI chat failed' },
      { status: 500 }
    );
  }
}
