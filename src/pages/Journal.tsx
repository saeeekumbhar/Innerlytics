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
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Journal</h1>
        <p className="text-slate-600 mt-1">Reflect on your thoughts and feelings.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setMode('free')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-colors ${
              mode === 'free' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <PenTool className="w-4 h-4 mr-2" />
            Free Write
          </button>
          <button
            onClick={() => setMode('guided')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-colors ${
              mode === 'guided' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Guided Reflection
          </button>
        </div>

        <div className="p-6 space-y-6">
          {mode === 'guided' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Choose a prompt:</p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setContent(prev => prev + (prev ? '\n\n' : '') + prompt + '\n')}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={mode === 'free' ? "Start writing..." : "Select a prompt above or start writing..."}
            className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700 leading-relaxed"
          />

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-4">
               {/* Mood Slider could go here */}
               <span className="text-xs text-slate-400">{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing & Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Entry
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
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
        >
          <h3 className="text-lg font-serif font-bold text-indigo-900 mb-2">AI Analysis</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/50 p-3 rounded-xl">
              <span className="text-xs text-indigo-500 uppercase tracking-wide">Primary Emotion</span>
              <p className="font-medium text-indigo-900">{analysis.primary_emotion}</p>
            </div>
            <div className="bg-white/50 p-3 rounded-xl">
              <span className="text-xs text-indigo-500 uppercase tracking-wide">Sentiment</span>
              <p className="font-medium text-indigo-900 capitalize">{analysis.sentiment}</p>
            </div>
          </div>
          <p className="text-indigo-800 text-sm leading-relaxed">{analysis.insight_summary}</p>
        </motion.div>
      )}
    </div>
  );
};

export default Journal;
