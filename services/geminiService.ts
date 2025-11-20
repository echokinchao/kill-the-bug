import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSystemMessage = async (level: number, bossName: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `
      You are the operating system of a computer currently under attack by a virus named "${bossName}" (Level ${level}).
      Generate a short, urgent, 1-sentence system alert notification in Simplified Chinese (中文) warning the user about this specific threat.
      Make it sound technical but slightly panicked. Do not include quotes.
      Example: 警告：检测到 ${bossName} 入侵，系统防火墙已失效！
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || `严重错误：检测到 ${bossName} 正在尝试修改注册表。`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `系统警报：发现未授权进程 ${bossName}。需立即执行清除操作。`;
  }
};

export const generateBossTaunt = async (bossName: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `
      You are a computer virus named "${bossName}". You have just been engaged by the user.
      Write a very short, glitchy, arrogant taunt in Simplified Chinese (中文) (max 10 words).
      Example: "你删不掉我的！"
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "我是不可战胜的。";
  } catch (error) {
    return "010101... 你的系统属于我！";
  }
};