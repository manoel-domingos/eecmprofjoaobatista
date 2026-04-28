import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

// Server-side AI call - keeps API key secure
export async function POST(request: NextRequest) {
  try {
    const { csvSnippet } = await request.json();

    if (!csvSnippet || typeof csvSnippet !== 'string') {
      return NextResponse.json(
        { error: 'CSV snippet is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured', fallback: true },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Limit to prevent huge JSON hallucination loops
    const limitedCsv = csvSnippet.substring(0, 1500);

    const prompt = `Analise as primeiras linhas dessa planilha escolar (formato CSV) e identifique a estrutura para importar alunos.
CSV:
${limitedCsv}

Responda APENAS com o objeto JSON solicitado. NUNCA inclua os dados da planilha de volta nos valores. Seja curto e conciso. Não use blocos markdown.
Formato do JSON (não adicione propriedades que não foram pedidas):
{
  "headerRowIndex": número da linha (0-indexed) onde estão os cabeçalhos,
  "columns": { "name": "NOME DO ALUNO", "class": "TURMA", ... }
}

Para a estrutura de alunos, as chaves suportadas em "columns" são: "name" (Aluno), "class" (Série/Turma), "shift" (Turno), "cpf", "birthDate" (Nascimento), "phone1" (Telefone), "phone2", "registration" (Matrícula), "observation" (Observação), "mother" (Mãe), "father" (Pai).
Se não houver coluna para alguma dessas chaves internas, não inclua a chave no objeto. Exemplo: {"headerRowIndex": 0, "columns": {"name": "NOME DO ALUNO", "class": "TURMA"}}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 256,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headerRowIndex: { type: Type.INTEGER },
            columns: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                class: { type: Type.STRING },
                shift: { type: Type.STRING },
                cpf: { type: Type.STRING },
                birthDate: { type: Type.STRING },
                phone1: { type: Type.STRING },
                phone2: { type: Type.STRING },
                registration: { type: Type.STRING },
                observation: { type: Type.STRING },
                mother: { type: Type.STRING },
                father: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const responseText = response.text || '{}';
    
    try {
      // Find the first { and the last }
      const startIndex = responseText.indexOf('{');
      const endIndex = responseText.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        const jsonStr = responseText.substring(startIndex, endIndex + 1);
        const result = JSON.parse(jsonStr);
        return NextResponse.json({ success: true, data: result });
      }
      const result = JSON.parse(responseText.trim().replace(/^```json/, '').replace(/```$/, '').trim());
      return NextResponse.json({ success: true, data: result });
    } catch (parseError) {
      console.warn("JSON parse failed.", parseError);
      return NextResponse.json({ success: false, fallback: true });
    }
  } catch (err) {
    console.error("AI Analysis failed:", err);
    return NextResponse.json(
      { error: 'AI analysis failed', fallback: true },
      { status: 200 }
    );
  }
}
