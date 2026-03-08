import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, Heart, BookOpen, Lightbulb, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { JournalEntry } from '../../features/journal/journalService';
import { generateEnhancedInsight, AIInsight } from '../../services/aiService';

interface Props {
  entries: JournalEntry[];
}

const AIInsightCard = ({ entries }: Props) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      <div className="glass rounded-[2rem] p-6 lg:p-12 soft-shadow border-none text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-4 text-[var(--color-pastel-purple)] opacity-50" />
        <p className="text-lg font-medium text-[var(--color-text-secondary)]">Start journaling to unlock AI insights ✨</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass rounded-[2rem] p-6 lg:p-12 soft-shadow border-none text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 mx-auto"
        >
          <Sparkles className="w-10 h-10 text-[var(--color-pastel-purple)]" />
        </motion.div>
        <p className="text-lg font-medium text-[var(--color-text-secondary)]">Reflecting on your journey...</p>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="glass rounded-[2rem] p-6 lg:p-12 soft-shadow border-none text-center space-y-4">
        <p className="text-lg text-[var(--color-text-secondary)]">Couldn't generate insights right now.</p>
        <button onClick={fetchInsight} className="text-sm font-medium px-4 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-full text-[var(--color-text-primary)] hover:bg-[var(--color-pastel-hover)] transition-colors inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      </div>
    );
  }

  const cards = [
    { icon: Sparkles, title: 'How You\'re Doing', content: insight.summary, color: '--color-pastel-purple', gradient: 'from-[var(--color-pastel-purple)]/10 to-[var(--color-pastel-blue)]/5' },
    { icon: TrendingUp, title: 'Pattern Detected', content: insight.detectedPattern, color: '--color-pastel-blue', gradient: 'from-[var(--color-pastel-blue)]/10 to-[var(--color-pastel-teal)]/5' },
    { icon: Heart, title: 'Coping Ideas', content: insight.copingSuggestions, color: '--color-pastel-pink', gradient: 'from-[var(--color-pastel-pink)]/10 to-[var(--color-pastel-peach)]/5' },
    { icon: BookOpen, title: 'Tomorrow\'s Prompt', content: insight.journalingPrompt, color: '--color-pastel-teal', gradient: 'from-[var(--color-pastel-teal)]/10 to-[var(--color-pastel-blue)]/5' },
    { icon: Lightbulb, title: 'One Small Step', content: insight.actionableStep, color: '--color-pastel-peach', gradient: 'from-[var(--color-pastel-peach)]/10 to-[var(--color-pastel-pink)]/5' },
  ];

  const next = () => setCurrentIndex((currentIndex + 1) % cards.length);
  const prev = () => setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);

  const CurrentIcon = cards[currentIndex].icon;

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

      <div className="glass rounded-[2rem] soft-shadow border-none relative overflow-hidden group w-full min-h-[260px] flex flex-col">
        {/* Navigation Arrows for Desktop overlay */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
          <button onClick={prev} className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-primary)]/80 backdrop-blur-md shadow-md border border-[var(--color-border-subtle)]/50 hover:bg-[var(--color-bg-primary)] hover:scale-110 transition-all text-[var(--color-text-primary)]" aria-label="Previous Insight">
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          <button onClick={next} className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-primary)]/80 backdrop-blur-md shadow-md border border-[var(--color-border-subtle)]/50 hover:bg-[var(--color-bg-primary)] hover:scale-110 transition-all text-[var(--color-text-primary)]" aria-label="Next Insight">
            <ChevronRight className="w-5 h-5 ml-0.5" />
          </button>
        </div>

        <div className="relative flex-1 flex flex-col w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex-1 w-full bg-gradient-to-br ${cards[currentIndex].gradient} flex flex-col justify-center items-center text-center p-6 md:p-12 z-10`}
            >
              {/* Background decorative blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-40 mix-blend-multiply dark:mix-blend-screen" style={{ backgroundColor: `var(${cards[currentIndex].color})` }} />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative z-20 flex flex-col items-center max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 mb-6 shadow-sm border border-white/20 dark:border-black/20" style={{ backgroundColor: `color-mix(in srgb, var(${cards[currentIndex].color}) 20%, transparent)` }}>
                  <CurrentIcon className="w-8 h-8" style={{ color: `var(${cards[currentIndex].color})` }} />
                </div>

                <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3 opacity-80">{cards[currentIndex].title}</h4>

                {Array.isArray(cards[currentIndex].content) ? (
                  <div className="space-y-4 w-full">
                    {(cards[currentIndex].content as string[]).map((item, j) => (
                      <div key={j} className="text-lg md:text-xl text-[var(--color-text-primary)] leading-relaxed font-medium bg-[var(--color-bg-primary)]/40 p-4 rounded-2xl border border-[var(--color-border-subtle)]/30 backdrop-blur-sm relative overflow-hidden group/item text-left w-full shadow-sm">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 opacity-70 group-hover/item:opacity-100 transition-opacity" style={{ backgroundColor: `var(${cards[currentIndex].color})` }} />
                        <p className="pl-3">{item}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xl md:text-2xl text-[var(--color-text-primary)] leading-relaxed font-medium font-serif">{cards[currentIndex].content}</p>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="bg-[var(--color-bg-card)] border-t border-[var(--color-border-subtle)]/30 p-4 flex justify-between items-center relative z-20">
          <button onClick={prev} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors md:hidden">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex justify-center gap-2 mx-auto">
            {cards.map((card, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8' : 'w-2.5 bg-[var(--color-border-strong)] hover:bg-[var(--color-text-secondary)]/50'}`}
                style={{ backgroundColor: i === currentIndex ? `var(${card.color})` : undefined }}
                aria-label={`Go to ${card.title}`}
              />
            ))}
          </div>

          <button onClick={next} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors md:hidden">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;
