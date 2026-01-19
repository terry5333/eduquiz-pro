
import { GoogleGenAI, Type } from "@google/genai";

/**
 * 使用 Gemini 3 Pro 生成測驗題目
 */
export const generateQuizQuestions = async (topic: string, count: number = 5) => {
  // Always use the direct process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `你是一位資深的教育專家。請針對主題「${topic}」生成 ${count} 題適合學生的選擇題。請使用繁體中文（台灣）。`,
      config: {
        thinkingConfig: { thinkingBudget: 4096 }, // 開啟思考模式以獲取更高質量的教育內容
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            propertyOrdering: ["id", "text", "options", "correctAnswerIndex", "explanation"]
          },
        },
      },
    });

    // Directly access the .text property from GenerateContentResponse
    const jsonStr = response.text;
    if (!jsonStr) throw new Error("AI 回傳內容為空");
    return JSON.parse(jsonStr.trim());
  } catch (err) {
    console.error("Gemini 生成失敗:", err);
    throw err;
  }
};

/**
 * 針對特定題目獲取 AI 解析
 */
export const getAnswerExplanation = async (question: string, answer: string) => {
  // Always use the direct process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `請解釋在題目「${question}」中，為什麼「${answer}」是正確答案。請用鼓勵學生的語氣撰寫，並使用繁體中文。`,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });
    // Directly access the .text property
    return response.text || "目前無法取得解析。";
  } catch (err) {
    console.error("Gemini 解析失敗:", err);
    return "解析生成失敗，請稍後再試。";
  }
};
