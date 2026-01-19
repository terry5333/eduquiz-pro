import { GoogleGenAI } from "@google/genai";
import { Type } from "@google/genai";

/**
 * Generates quiz questions based on a given topic using Gemini 3 Pro.
 * Returns an array of Question objects in JSON format.
 */
export const generateQuizQuestions = async (topic: string, count: number = 5) => {
  // Fix: Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use 'gemini-3-pro-preview' for complex reasoning tasks like educational content generation
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `請針對主題「${topic}」生成 ${count} 題選擇題。請使用繁體中文（台灣）。每題應包含 id, text, options (4個選項), correctAnswerIndex (0-3), 和 explanation。`,
      config: {
        // Adding thinking budget for complex reasoning tasks as per guidelines
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "隨機生成的唯一識別碼" },
              text: { type: Type.STRING, description: "題目文本" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "四個選項的數組"
              },
              correctAnswerIndex: { type: Type.NUMBER, description: "正確答案的索引（0-3）" },
              explanation: { type: Type.STRING, description: "簡單的答案解析" }
            },
            // Use propertyOrdering instead of required in responseSchema
            propertyOrdering: ["id", "text", "options", "correctAnswerIndex", "explanation"]
          },
        },
      },
    });

    // Fix: Access the .text property directly as a getter, not a method call
    const jsonStr = response.text;
    if (!jsonStr) return [];
    return JSON.parse(jsonStr.trim());
  } catch (err) {
    console.error("Gemini Quiz Generation Error:", err);
    return [];
  }
};

/**
 * Gets a detailed explanation for a specific question and answer pair.
 */
export const getAnswerExplanation = async (question: string, answer: string) => {
  // Fix: Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use 'gemini-3-pro-preview' for detailed educational explanations to ensure high quality
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `請解釋為什麼在題目「${question}」中，「${answer}」是正確答案。請使用繁體中文，解釋要深入淺出且語氣親切。`,
      config: {
        // Reasoning-heavy task, set a small thinking budget
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });
    // Fix: Access the .text property directly as a getter
    return response.text || "目前無法取得解析。";
  } catch (err) {
    console.error("Gemini Explanation Error:", err);
    return "解析生成失敗。";
  }
};
