import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Heart, BookOpen, Lightbulb, RefreshCw } from 'lucide-react';
import { JournalEntry } from '../../features/journal/journalService';
import { generateEnhancedInsight, AIInsight } from '../../services/aiService';

interface Props {
  entries: JournalEntry[];
}

const AIInsightCard = ({ entries }: Props) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchInsight = async () => {
    if (entries.length === 0) return;
    setLoading(true);
    setError(false);
    try {
      const result = await generateEnhancedInsight(entries);
      setInsight(result);
    } catch (err) {
      console.error('AI insight error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none text-center">
        <Sparkles className="w-8 h-8 mx-auto mb-3 text-[var(--color-pastel-purple)] opacity-50" />
        <p className="text-sm text-[var(--color-text-secondary)]">Start journaling to unlock AI insights ✨</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none text-center space-y-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 mx-auto"
        >
          <Sparkles className="w-8 h-8 text-[var(--color-pastel-purple)]" />
        </motion.div>
        <p className="text-sm text-[var(--color-text-secondary)]">Reflecting on your entries...</p>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none text-center space-y-3">
        <p className="text-sm text-[var(--color-text-secondary)]">Couldn't generate insights right now.</p>
        <button onClick={fetchInsight} className="text-sm text-[var(--color-pastel-purple)] hover:underline flex items-center justify-center gap-1 mx-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      </div>
    );
  }

  const cards = [
    { icon: Sparkles, title: 'How You\'re Doing', content: insight.summary, color: '--color-pastel-purple' },
    { icon: TrendingUp, title: 'Pattern Detected', content: insight.detectedPattern, color: '--color-pastel-blue' },
    { icon: Heart, title: 'Coping Ideas', content: insight.copingSuggestions, color: '--color-pastel-pink' },
    { icon: BookOpen, title: 'Tomorrow\'s Prompt', content: insight.journalingPrompt, color: '--color-pastel-teal' },
    { icon: Lightbulb, title: 'One Small Step', content: insight.actionableStep, color: '--color-pastel-peach' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-pastel-purple)]" />
          AI Insights
        </h3>
        <button onClick={fetchInsight} className="p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors" title="Refresh insights">
          <RefreshCw className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </button>
      </div>

      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="glass rounded-2xl p-5 soft-shadow border-none relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
        >
          <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -mt-6 -mr-6 pointer-events-none opacity-20`} style={{ backgroundColor: `var(${card.color})` }} />
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `var(${card.color})`, opacity: 0.2 }}>
              <card.icon className="w-4.5 h-4.5" style={{ color: `var(${card.color})` }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">{card.title}</p>
              {Array.isArray(card.content) ? (
                <ul className="space-y-1.5">
                  {card.content.map((item, j) => (
                    <li key={j} className="text-sm text-[var(--color-text-primary)] leading-relaxed flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: `var(${card.color})` }} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{card.content}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AIInsightCard;
