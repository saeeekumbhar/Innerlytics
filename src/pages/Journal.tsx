import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addJournalEntry } from '../services/journal';
import { generateJsonContent } from '../services/gemini';
import { motion } from 'motion/react';
import { PenTool, BookOpen, Save, Loader } from 'lucide-react';
import { Type } from '@google/genai';

const prompts = [
  "What triggered today's strongest emotion?",
  "What thoughts kept repeating today?",
  "What did you handle well?",
  "What are you grateful for right now?",
  "Describe a moment where you felt at peace."
];

const Journal = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'free' | 'guided'>('free');
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(5); // Default neutral
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // 1. Generate AI Analysis
      const schema = {
        type: Type.OBJECT,
        properties: {
          primary_emotion: { type: Type.STRING },
          emotion_intensity: { type: Type.NUMBER },
          sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
          anxiety_score: { type: Type.NUMBER },
          insight_summary: { type: Type.STRING },
        },
        required: ["primary_emotion", "sentiment", "insight_summary"]
      };

      const aiResult = await generateJsonContent(
        `Analyze this journal entry: "${content}"`,
        schema
      );

      setAnalysis(aiResult);

      // 2. Save to Firestore
      await addJournalEntry({
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        moodScore: moodScore, // User selected or AI inferred? Let's stick to user selected for now, or maybe AI could suggest.
        moodLabel: aiResult.primary_emotion || 'Neutral',
        content,
        aiAnalysisJson: JSON.stringify(aiResult),
        createdAt: new Date(),
      });

      setContent('');
      alert('Journal entry saved!');
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Failed to save journal entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Journal</h1>
        <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Reflect on your thoughts and feelings.</p>
      </header>

      <div className="glass rounded-[2rem] soft-shadow border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-pastel-pink)]/10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[var(--color-pastel-teal)]/10 rounded-full blur-2xl -mb-10 -ml-10 pointer-events-none"></div>

        <div className="flex border-b border-[var(--color-border-subtle)] relative z-10">
          <button
            onClick={() => setMode('free')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-colors ${mode === 'free' ? 'bg-[var(--color-pastel-purple)]/10 text-[var(--color-pastel-purple)] shadow-inner' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]'
              }`}
          >
            <PenTool className="w-4 h-4 mr-2" />
            Free Write
          </button>
          <button
            onClick={() => setMode('guided')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-colors ${mode === 'guided' ? 'bg-[var(--color-pastel-purple)]/10 text-[var(--color-pastel-purple)] shadow-inner' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)]'
              }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Guided Reflection
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 relative z-10">
          {mode === 'guided' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Choose a prompt:</p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setContent(prev => prev + (prev ? '\n\n' : '') + prompt + '\n')}
                    className="px-4 py-2 bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-xs md:text-sm rounded-full hover:bg-[var(--color-pastel-purple)]/10 hover:text-[var(--color-pastel-purple)] hover:border-[var(--color-pastel-purple)]/30 transition-all duration-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="glow-focus rounded-2xl transition-shadow duration-300">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={mode === 'free' ? "Start writing..." : "Select a prompt above or start writing..."}
              className="w-full h-64 p-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 focus:outline-none resize-none text-[var(--color-text-primary)] leading-relaxed transition-colors placeholder:text-[var(--color-text-secondary)]/70 font-sans"
            />
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center space-x-4">
              {/* Mood Slider could go here */}
              <span className="text-xs text-[var(--color-text-secondary)]">{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-full font-medium transition-all duration-300 soft-shadow hover:shadow-[0_8px_25px_-8px_rgba(200,182,255,0.6)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-3 animate-spin" />
                  Analyzing & Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Entry ✨
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[2rem] p-6 lg:p-8 border-none relative overflow-hidden bg-[var(--color-pastel-purple)]/5"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-pastel-purple)]/10 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 relative z-10 flex items-center">
            AI Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
            <div className="bg-[var(--color-bg-primary)]/40 p-4 rounded-[1.5rem]">
              <span className="text-xs text-[var(--color-pastel-purple)] uppercase tracking-wide font-medium">Primary Emotion</span>
              <p className="font-medium text-[var(--color-text-primary)] mt-1">{analysis.primary_emotion}</p>
            </div>
            <div className="bg-[var(--color-bg-primary)]/40 p-4 rounded-[1.5rem]">
              <span className="text-xs text-[var(--color-pastel-blue)] uppercase tracking-wide font-medium">Sentiment</span>
              <p className="font-medium text-[var(--color-text-primary)] mt-1 capitalize">{analysis.sentiment}</p>
            </div>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed relative z-10">{analysis.insight_summary}</p>
        </motion.div>
      )}
    </div>
  );
};

export default Journal;
