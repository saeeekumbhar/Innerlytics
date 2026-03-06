import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing Gemini API Key");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const generateContent = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};

export const generateJsonContent = async (prompt: string, schema: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating JSON content:", error);
    throw error;
  }
};
