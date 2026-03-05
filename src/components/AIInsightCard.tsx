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
    <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow relative overflow-hidden bg-gradient-to-br from-[var(--color-pastel-purple)]/5 to-[var(--color-pastel-blue)]/5 border-none">
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center mb-4 relative z-10">
        <Sparkles className="w-6 h-6 text-[var(--color-pastel-purple)] mr-3" />
        <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">AI Insight</h2>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3 relative z-10">
          <div className="h-4 bg-[var(--color-pastel-purple)]/20 rounded-full w-3/4"></div>
          <div className="h-4 bg-[var(--color-pastel-blue)]/20 rounded-full w-1/2"></div>
        </div>
      ) : (
        <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed relative z-10">
          {insight}
        </p>
      )}
    </div>
  );
};

export default AIInsightCard;
