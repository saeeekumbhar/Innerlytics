import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addJournalEntry } from './journalService';
import { generateJsonContent } from '../../services/geminiService';
import { motion } from 'motion/react';
import { PenTool, BookOpen, Save, Loader, Mic, Image as ImageIcon, X } from 'lucide-react';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { useEffect } from 'react';
import { Type } from '@google/genai';

type Template = { id: string, name: string, prompts: string[] };
const templates: Template[] = [
  { id: 'daily', name: 'Daily Reflection', prompts: ['How was your day?', 'What went well today?', 'What could be better tomorrow?'] },
  { id: 'gratitude', name: 'Gratitude Journal', prompts: ['List three things you are grateful for today:', '1. ', '2. ', '3. '] },
  { id: 'stress', name: 'Stress Release', prompts: ['What is bothering you right now?', 'Why does it feel stressful?'] },
  { id: 'self', name: 'Self Reflection', prompts: ['What did I learn about myself today?', 'How did I react to challenges?'] }
];

const Journal = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'free' | 'guided'>('free');
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [moodScore, setMoodScore] = useState(5); // Default neutral
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [notebookStyle, setNotebookStyle] = useState<'blank' | 'lined' | 'dotted'>('blank');

  const stickers = ['🌸', '✨', '☕', '🌧️', '🧸', '💖', '🌱', '🌙', '🎯', '🔥'];

  const { isListening, transcript, setTranscript, startListening, stopListening, isSupported } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setContent(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript);
      setTranscript('');
    }
  }, [transcript, setTranscript]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoUrl(dataUrl);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !photoUrl) || !user) return;

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

      // 2. Save to Firestore Local Mock
      await addJournalEntry({
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        moodScore: moodScore,
        moodLabel: aiResult.primary_emotion || 'Neutral',
        content,
        photoUrl: photoUrl || undefined,
        aiAnalysisJson: JSON.stringify(aiResult),
      });

      setContent('');
      setPhotoUrl(null);
      alert('Journal entry saved!');
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Failed to save journal entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-220px)] gap-5 max-w-7xl mx-auto w-full relative">

      {/* Left Sidebar - Desktop */}
      <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col gap-5 order-1 md:order-none hidden md:flex">
        <header className="px-2">
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">Journal</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">Reflect on your thoughts.</p>
        </header>

        <div className="glass rounded-[2rem] p-5 soft-shadow border-none flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-purple)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none"></div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] px-2 relative z-10">Notebook Style</h3>
          <div className="flex flex-col space-y-2 relative z-10">
            {(['blank', 'lined', 'dotted'] as const).map(style => (
              <button
                key={style}
                onClick={() => setNotebookStyle(style)}
                className={`w-full flex items-center px-4 py-3 rounded-2xl text-left capitalize transition-all duration-300 font-medium text-sm ${notebookStyle === style ? 'bg-[var(--color-pastel-purple)]/20 text-[var(--color-pastel-purple)] shadow-sm' : 'hover:bg-[var(--color-sidebar-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                {style}
                {notebookStyle === style && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-pastel-purple)]"></span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 glass rounded-[2rem] soft-shadow border-none overflow-hidden relative flex flex-col min-h-0 order-2 md:order-none">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-primary)]/50">
          <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">Journal</h1>
          <div className="flex bg-[var(--color-bg-card)]/50 rounded-full p-1 border border-[var(--color-border-subtle)]/30 backdrop-blur-sm">
            {(['blank', 'lined', 'dotted'] as const).map(style => (
              <button
                key={style}
                onClick={() => setNotebookStyle(style)}
                className={`px-3 py-1 text-xs font-semibold capitalize rounded-full transition-all ${notebookStyle === style ? 'bg-[var(--color-pastel-purple)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

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

        <div className="p-4 md:p-6 flex-1 flex flex-col min-h-0 relative z-10 gap-4">
          {mode === 'guided' && (
            <div className="space-y-4 shrink-0">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Choose a guided template:</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setContent(template.prompts.map(p => p + '\n\n').join(''))}
                    className="px-4 py-2 bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-xs md:text-sm rounded-full hover:bg-[var(--color-pastel-purple)]/10 hover:text-[var(--color-pastel-purple)] hover:border-[var(--color-pastel-purple)]/30 transition-all duration-300 font-medium soft-shadow-sm"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notebook Textarea */}
          <div className="glow-focus rounded-2xl transition-shadow duration-300 flex-1 flex flex-col min-h-0 relative">
            {notebookStyle === 'lined' && (
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'repeating-linear-gradient(transparent, transparent 27px, #A0C4FF 28px)', marginTop: '28px' }} />
            )}
            {notebookStyle === 'dotted' && (
              <div className="absolute inset-x-8 inset-y-8 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(var(--color-text-secondary) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={mode === 'free' ? "Start writing..." : "Select a prompt above or start writing..."}
              className={`w-full flex-1 p-5 rounded-2xl border ${notebookStyle !== 'blank' ? 'border-transparent bg-transparent' : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30'} focus:outline-none resize-none text-[var(--color-text-primary)] leading-relaxed transition-all placeholder:text-[var(--color-text-secondary)]/70 font-sans z-10 relative`}
              style={{ lineHeight: notebookStyle === 'lined' ? '28px' : '1.75' }}
            />
          </div>

          {photoUrl && (
            <div className="relative shrink-0 mt-2 group self-start">
              <img src={photoUrl} alt="Journal Attachment" className="max-h-32 rounded-xl object-cover soft-shadow" />
              <button
                onClick={() => setPhotoUrl(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Desktop */}
      <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col gap-5 order-3 hidden md:flex">
        <div className="glass rounded-[2rem] p-5 soft-shadow border-none flex flex-col gap-5 flex-1 overflow-y-auto hide-scrollbar relative">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[var(--color-pastel-blue)]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] px-2 mb-3">Stickers</h3>
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 relative z-10">
              {stickers.map(s => (
                <button
                  key={s}
                  onClick={() => setContent(prev => prev + s)}
                  className="aspect-square rounded-xl hover:bg-[var(--color-bg-primary)] flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-90"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">Word Count</span>
              <span className="text-xs font-bold text-[var(--color-pastel-purple)]">
                {content.split(/\s+/).filter(w => w.length > 0).length}
              </span>
            </div>

            <div className="flex gap-2">
              <label className="flex-1 py-3 flex justify-center items-center rounded-2xl bg-[var(--color-pastel-blue)]/10 text-[var(--color-pastel-blue)] hover:bg-[var(--color-pastel-blue)]/20 cursor-pointer transition-colors" title="Attach Photo">
                <ImageIcon className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              {isSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex-1 py-3 flex justify-center items-center rounded-2xl transition-all duration-300 ${isListening
                    ? 'bg-[var(--color-danger)] text-white animate-pulse'
                    : 'bg-[var(--color-pastel-purple)]/10 text-[var(--color-pastel-purple)] hover:bg-[var(--color-pastel-purple)]/20'}`}
                  title={isListening ? "Stop listening" : "Start voice journaling"}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'scale-110' : ''}`} />
                </button>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !photoUrl)}
              className="w-full py-4 bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-2xl font-bold transition-all duration-300 soft-shadow hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Footer (Hidden on Desktop) */}
      <div className="md:hidden glass rounded-3xl p-4 flex flex-col gap-3 order-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            <label className="p-3 rounded-full bg-[var(--color-pastel-blue)]/10 text-[var(--color-pastel-blue)] cursor-pointer">
              <ImageIcon className="w-5 h-5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {isSupported && (
              <button onClick={isListening ? stopListening : startListening} className="p-3 rounded-full bg-[var(--color-pastel-purple)]/10 text-[var(--color-pastel-purple)]">
                <Mic className={`w-5 h-5 ${isListening ? 'scale-110' : ''}`} />
              </button>
            )}
          </div>
          <button onClick={handleSubmit} disabled={isSubmitting || (!content.trim() && !photoUrl)} className="px-6 py-3 bg-[var(--color-pastel-purple)] text-white rounded-full font-bold text-sm flex items-center shadow-sm disabled:opacity-50">
            {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save</>}
          </button>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
          {stickers.map(s => <button key={s} onClick={() => setContent(prev => prev + s)} className="text-xl px-2 shrink-0">{s}</button>)}
        </div>
      </div>

      {/* AI Analysis Modal Overlay */}
      {analysis && (
        <div className="fixed inset-0 z-[100] bg-[var(--color-bg-primary)]/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setAnalysis(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass w-full max-w-lg rounded-[2rem] p-6 lg:p-8 border-[var(--color-border-subtle)] shadow-xl relative overflow-hidden bg-[var(--color-bg-card)]"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setAnalysis(null)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors z-20">
              <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </button>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-purple)]/10 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-5 relative z-10 flex items-center">
              Entry Saved! ✨ Analysis Preview
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="bg-[var(--color-bg-primary)] p-4 rounded-[1.5rem] border border-[var(--color-border-subtle)]/50">
                <span className="text-[10px] text-[var(--color-pastel-purple)] uppercase tracking-wide font-bold">Primary Emotion</span>
                <p className="font-bold text-[var(--color-text-primary)] mt-1 text-lg">{analysis.primary_emotion}</p>
              </div>
              <div className="bg-[var(--color-bg-primary)] p-4 rounded-[1.5rem] border border-[var(--color-border-subtle)]/50">
                <span className="text-[10px] text-[var(--color-pastel-blue)] uppercase tracking-wide font-bold">Sentiment</span>
                <p className="font-bold text-[var(--color-text-primary)] mt-1 text-lg capitalize">{analysis.sentiment}</p>
              </div>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed relative z-10">{analysis.insight_summary}</p>
            <button onClick={() => setAnalysis(null)} className="w-full mt-6 py-3 bg-[var(--color-pastel-purple)] text-white rounded-xl font-bold transition-all hover:bg-[var(--color-pastel-purple)]/90">
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Journal;
