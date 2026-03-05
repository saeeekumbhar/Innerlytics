import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Meh, Frown, Heart, Zap, ChevronDown } from 'lucide-react';
import { addJournalEntry } from './journalService';
import { useAuth } from '../../context/AuthContext';

const moods = [
  { score: 2, label: 'Low', icon: Frown, color: 'text-[var(--color-pastel-blue)]', bg: 'bg-[var(--color-pastel-blue)]/20', ring: 'ring-[var(--color-pastel-blue)]' },
  { score: 4, label: 'Anxious', icon: Zap, color: 'text-[var(--color-pastel-purple)]', bg: 'bg-[var(--color-pastel-purple)]/20', ring: 'ring-[var(--color-pastel-purple)]' },
  { score: 6, label: 'Neutral', icon: Meh, color: 'text-[#E5B887]', bg: 'bg-[var(--color-pastel-peach)]/30', ring: 'ring-[var(--color-pastel-peach)]' },
  { score: 8, label: 'Good', icon: Smile, color: 'text-[var(--color-pastel-teal)]', bg: 'bg-[var(--color-pastel-teal)]/40', ring: 'ring-[var(--color-pastel-teal)]' },
  { score: 10, label: 'Great', icon: Heart, color: 'text-[var(--color-pastel-pink)]', bg: 'bg-[var(--color-pastel-pink)]/30', ring: 'ring-[var(--color-pastel-pink)]' },
];

const emotionOptions = [
  'Hopeful', 'Grateful', 'Calm', 'Happy', 'Loved',
  'Tired', 'Anxious', 'Stressed', 'Sad', 'Angry',
  'Motivated', 'Creative', 'Lonely', 'Overwhelmed', 'Peaceful',
];

const contextOptions = [
  { value: 'work', label: '💼 Work' },
  { value: 'home', label: '🏠 Home' },
  { value: 'social', label: '👥 Social' },
  { value: 'alone', label: '🧘 Alone' },
  { value: 'school', label: '📚 School' },
  { value: 'outdoors', label: '🌿 Outdoors' },
  { value: 'other', label: '✨ Other' },
];

const SliderInput = ({ label, value, onChange, colorVar }: { label: string; value: number; onChange: (v: number) => void; colorVar: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `var(${colorVar})`, color: 'white', opacity: 0.9 }}>
        {value}/10
      </span>
    </div>
    <input
      type="range"
      min={1}
      max={10}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, var(${colorVar}) 0%, var(${colorVar}) ${(value - 1) * 11.1}%, var(--color-border-subtle) ${(value - 1) * 11.1}%, var(--color-border-subtle) 100%)`,
      }}
    />
  </div>
);

const MoodCheckIn = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: mood, 2: details, 3: journal

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion].slice(0, 5)
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood || !user) return;

    setIsSubmitting(true);
    try {
      const moodObj = moods.find(m => m.score === selectedMood);
      await addJournalEntry({
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        moodScore: selectedMood,
        moodLabel: moodObj?.label || 'Unknown',
        content: note,
        energyLevel,
        stressLevel,
        anxietyLevel,
        emotionTags: selectedEmotions,
        context: context || undefined,
      });
      onComplete();
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-pink)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-pastel-blue)]/10 rounded-full blur-2xl -mb-8 -ml-8 pointer-events-none"></div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-[var(--color-pastel-purple)]' : s < step ? 'w-4 bg-[var(--color-pastel-teal)]' : 'w-4 bg-[var(--color-border-subtle)]'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Mood Selection */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <h2 className="text-2xl font-serif font-semibold text-[var(--color-text-primary)] mb-6 text-center">How are you feeling today?</h2>
            <div className="flex justify-between mb-6 px-2 md:px-6">
              {moods.map((mood) => (
                <motion.button
                  key={mood.score}
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setSelectedMood(mood.score); }}
                  className={`relative flex flex-col items-center p-3 rounded-2xl md:rounded-3xl transition-all duration-300 ${selectedMood === mood.score
                    ? `${mood.bg} ring-2 ring-offset-4 ring-offset-[var(--color-bg-card)] ${mood.ring} shadow-lg scale-110`
                    : `hover:${mood.bg} grayscale-[0.3] hover:grayscale-0 opacity-70 hover:opacity-100`
                    }`}
                >
                  {selectedMood === mood.score && (
                    <motion.div
                      layoutId="pulse"
                      className={`absolute inset-0 rounded-2xl md:rounded-3xl ${mood.bg} -z-10`}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <mood.icon className={`w-10 h-10 md:w-12 md:h-12 mb-3 drop-shadow-sm ${mood.color}`} />
                  <span className={`text-xs md:text-sm font-medium ${selectedMood === mood.score ? mood.color : 'text-[var(--color-text-secondary)]'}`}>{mood.label}</span>
                </motion.button>
              ))}
            </div>
            {selectedMood && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setStep(2)}
                className="w-full py-3.5 text-white rounded-full font-medium bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] hover:scale-[1.02] active:scale-95 transition-all duration-300 soft-shadow"
              >
                Continue ✨
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Step 2: Dimensions + Emotions + Context */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold text-[var(--color-text-primary)] text-center">Tell me more...</h2>

            {/* Sliders */}
            <div className="space-y-5 p-5 bg-[var(--color-bg-primary)]/30 rounded-2xl border border-[var(--color-border-subtle)]/50">
              <SliderInput label="⚡ Energy Level" value={energyLevel} onChange={setEnergyLevel} colorVar="--color-pastel-teal" />
              <SliderInput label="😰 Stress Level" value={stressLevel} onChange={setStressLevel} colorVar="--color-pastel-peach" />
              <SliderInput label="💭 Anxiety Level" value={anxietyLevel} onChange={setAnxietyLevel} colorVar="--color-pastel-pink" />
            </div>

            {/* Emotion Chips */}
            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">What emotions resonate? <span className="opacity-60">(up to 5)</span></p>
              <div className="flex flex-wrap gap-2">
                {emotionOptions.map(emotion => (
                  <motion.button
                    key={emotion}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleEmotion(emotion)}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${selectedEmotions.includes(emotion)
                      ? 'bg-[var(--color-pastel-purple)]/20 border-[var(--color-pastel-purple)]/50 text-[var(--color-pastel-purple)] shadow-sm'
                      : 'border-[var(--color-border-subtle)]/50 text-[var(--color-text-secondary)] hover:border-[var(--color-pastel-purple)]/30 hover:bg-[var(--color-pastel-hover)]'
                      }`}
                  >
                    {emotion}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Context Selector */}
            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">What's your current context?</p>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {contextOptions.map(opt => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setContext(context === opt.value ? '' : opt.value)}
                    className={`px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-300 border text-center ${context === opt.value
                      ? 'bg-[var(--color-pastel-blue)]/20 border-[var(--color-pastel-blue)]/50 text-[var(--color-text-primary)] shadow-sm'
                      : 'border-[var(--color-border-subtle)]/50 text-[var(--color-text-secondary)] hover:bg-[var(--color-pastel-hover)]'
                      }`}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3.5 rounded-full font-medium text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-pastel-hover)] transition-all">
                Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3.5 text-white rounded-full font-medium bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] hover:scale-[1.02] active:scale-95 transition-all duration-300 soft-shadow">
                Continue ✨
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Journal Note + Submit */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
            <h2 className="text-2xl font-serif font-semibold text-[var(--color-text-primary)] text-center">Any thoughts to capture?</h2>
            <div className="glow-focus rounded-2xl transition-shadow duration-300">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write freely — this is your safe space..."
                className="w-full p-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 focus:outline-none resize-none text-[var(--color-text-primary)] transition-colors placeholder:text-[var(--color-text-secondary)]/70 leading-relaxed"
                rows={5}
              />
            </div>

            {/* Summary preview */}
            <div className="p-4 bg-[var(--color-bg-primary)]/30 rounded-2xl border border-[var(--color-border-subtle)]/50 space-y-2">
              <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Check-in Summary</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-pastel-purple)]/15 text-[var(--color-text-primary)]">Mood: {moods.find(m => m.score === selectedMood)?.label}</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-pastel-teal)]/15 text-[var(--color-text-primary)]">Energy: {energyLevel}/10</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-pastel-peach)]/15 text-[var(--color-text-primary)]">Stress: {stressLevel}/10</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-pastel-pink)]/15 text-[var(--color-text-primary)]">Anxiety: {anxietyLevel}/10</span>
                {context && <span className="px-2.5 py-1 rounded-full bg-[var(--color-pastel-blue)]/15 text-[var(--color-text-primary)]">{contextOptions.find(c => c.value === context)?.label}</span>}
              </div>
              {selectedEmotions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedEmotions.map(e => (
                    <span key={e} className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-pastel-purple)]/10 text-[var(--color-pastel-purple)]">{e}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-3.5 rounded-full font-medium text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-pastel-hover)] transition-all">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 text-white rounded-full font-medium transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-95 soft-shadow bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] hover:shadow-[0_8px_25px_-8px_rgba(200,182,255,0.6)]"
              >
                {isSubmitting ? 'Saving...' : 'Save to my journal ✨'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodCheckIn;
