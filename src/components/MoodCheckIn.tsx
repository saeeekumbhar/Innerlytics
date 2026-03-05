import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smile, Meh, Frown, Heart, Zap } from 'lucide-react';
import { addJournalEntry } from '../services/journal';
import { useAuth } from '../context/AuthContext';

const moods = [
  { score: 2, label: 'Low', icon: Frown, color: 'text-[var(--color-pastel-blue)]', bg: 'bg-[var(--color-pastel-blue)]/20', ring: 'ring-[var(--color-pastel-blue)]' },
  { score: 4, label: 'Anxious', icon: Zap, color: 'text-[var(--color-pastel-purple)]', bg: 'bg-[var(--color-pastel-purple)]/20', ring: 'ring-[var(--color-pastel-purple)]' },
  { score: 6, label: 'Neutral', icon: Meh, color: 'text-[#E5B887]', bg: 'bg-[var(--color-pastel-peach)]/30', ring: 'ring-[var(--color-pastel-peach)]' },
  { score: 8, label: 'Good', icon: Smile, color: 'text-[var(--color-pastel-teal)]', bg: 'bg-[var(--color-pastel-teal)]/40', ring: 'ring-[var(--color-pastel-teal)]' },
  { score: 10, label: 'Great', icon: Heart, color: 'text-[var(--color-pastel-pink)]', bg: 'bg-[var(--color-pastel-pink)]/30', ring: 'ring-[var(--color-pastel-pink)]' },
];

const MoodCheckIn = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      <h2 className="text-2xl font-serif font-semibold text-[var(--color-text-primary)] mb-6 text-center">How are you feeling today?</h2>

      <div className="flex justify-between mb-8 px-2 md:px-6">
        {moods.map((mood) => (
          <motion.button
            key={mood.score}
            whileHover={{ scale: 1.15, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedMood(mood.score)}
            className={`relative flex flex-col items-center p-3 rounded-2xl md:rounded-3xl transition-all duration-300 ${selectedMood === mood.score
              ? `${mood.bg} ring-2 ring-offset-4 ring-offset-[var(--color-bg-card)] ${mood.ring} shadow-lg shadow-${mood.ring.replace('ring-', '')}/20 scale-110`
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
        <motion.div
          initial={{ opacity: 0, height: 0, y: 10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          transition={{ duration: 0.4, type: "spring" }}
        >
          <div className="glow-focus rounded-2xl transition-shadow duration-300 mb-6">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a soft note to your day (optional)..."
              className="w-full p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 focus:outline-none resize-none text-[var(--color-text-primary)] transition-colors placeholder:text-[var(--color-text-secondary)]/70"
              rows={3}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 text-white rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:scale-100 hover:scale-[1.02] active:scale-95 soft-shadow
                       bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] hover:shadow-[0_8px_25px_-8px_rgba(200,182,255,0.6)]"
          >
            {isSubmitting ? 'Saving...' : 'Save carefully to my journal ✨'}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MoodCheckIn;
