import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateContent } from '../services/gemini';

const AIInsightCard = ({ entries }: { entries: any[] }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      if (entries.length === 0) return;
      
      setLoading(true);
      try {
        // Simple prompt for now
        const prompt = `Analyze these journal entries and provide a short, supportive insight (max 2 sentences) about the user's recent emotional state. Be empathetic and constructive. Entries: ${JSON.stringify(entries.slice(0, 5).map(e => ({ date: e.date, mood: e.moodLabel, content: e.content })))}`;
        const result = await generateContent(prompt);
        setInsight(result);
      } catch (error) {
        console.error("Error fetching insight:", error);
      } finally {
        setLoading(false);
      }
    };

    if (entries.length > 0) {
      fetchInsight();
    }
  }, [entries]);

  if (!insight && !loading) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
      <div className="flex items-center mb-3">
        <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
        <h2 className="text-lg font-serif font-bold text-indigo-900">AI Insight</h2>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
          <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
        </div>
      ) : (
        <p className="text-indigo-800 text-sm leading-relaxed font-medium">
          {insight}
        </p>
      )}
    </div>
  );
};

export default AIInsightCard;
