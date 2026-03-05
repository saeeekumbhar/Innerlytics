import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smile, Meh, Frown, Heart, Zap } from 'lucide-react';
import { addJournalEntry } from '../services/journal';
import { useAuth } from '../context/AuthContext';

const moods = [
  { score: 2, label: 'Low', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-100' },
  { score: 4, label: 'Anxious', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-100' },
  { score: 6, label: 'Neutral', icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { score: 8, label: 'Good', icon: Smile, color: 'text-green-500', bg: 'bg-green-100' },
  { score: 10, label: 'Great', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100' },
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
        createdAt: new Date(),
      });
      onComplete();
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-xl font-serif font-bold text-slate-900 mb-4">How are you feeling today?</h2>
      
      <div className="flex justify-between mb-6">
        {moods.map((mood) => (
          <motion.button
            key={mood.score}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMood(mood.score)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
              selectedMood === mood.score 
                ? `${mood.bg} ring-2 ring-offset-2 ring-${mood.color.split('-')[1]}-400` 
                : 'hover:bg-slate-50'
            }`}
          >
            <mood.icon className={`w-8 h-8 mb-2 ${mood.color}`} />
            <span className="text-xs font-medium text-slate-600">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a quick note (optional)..."
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-4 text-sm"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Check-in'}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MoodCheckIn;
