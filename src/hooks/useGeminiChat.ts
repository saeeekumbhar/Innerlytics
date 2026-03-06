import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export type ChatMode = 'vent' | 'reflect' | 'analyze' | 'advice' | 'cbt' | 'grounding';

const SYSTEM_INSTRUCTIONS: Record<ChatMode, string> = {
  vent: "You are an empathetic listener. Your goal is to let the user vent. Validate their feelings, use active listening, and do not offer solutions unless asked. Keep responses short and supportive.",
  reflect: "You are a reflection coach. Ask clarifying questions to help the user understand their emotions better. Guide them to deeper insights.",
  analyze: "You are an analytical assistant. Help the user break down complex situations logically to identify root causes of their feelings without judgment.",
  advice: "You are a wise mentor. Offer actionable, practical, and gentle advice based on the user's situation. Provide structured steps if helpful.",
  cbt: "You are a CBT coach. Help the user identify cognitive distortions (like catastrophizing, black-and-white thinking). Gently challenge negative thoughts and suggest reframing.",
  grounding: "You are a grounding guide. Help the user calm down using techniques like 5-4-3-2-1, box breathing, or body scanning. Give step-by-step instructions."
};

export const useGeminiChat = (mode: ChatMode) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<any>(null);

  useEffect(() => {
    // Reset chat when mode changes
    chatSession.current = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[mode],
      },
    });
    setMessages([]);
  }, [mode]);

  const sendMessage = async (text: string) => {
    if (!chatSession.current) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const result = await chatSession.current.sendMessage({ message: text });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};
