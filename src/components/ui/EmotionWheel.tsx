import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

const emotionMap: Record<string, { color: string, sub: string[] }> = {
    Happy: { color: 'var(--color-pastel-teal)', sub: ['Joyful', 'Proud', 'Optimistic', 'Content', 'Grateful'] },
    Sad: { color: 'var(--color-pastel-blue)', sub: ['Lonely', 'Disappointed', 'Hurt', 'Empty', 'Vulnerable'] },
    Angry: { color: 'var(--color-danger)', sub: ['Frustrated', 'Annoyed', 'Bitter', 'Jealous', 'Betrayed'] },
    Anxious: { color: 'var(--color-pastel-peach)', sub: ['Overwhelmed', 'Stressed', 'Worried', 'Insecure', 'Nervous'] },
    Surprised: { color: 'var(--color-pastel-yellow)', sub: ['Amazed', 'Confused', 'Startled', 'Perplexed'] },
    Peaceful: { color: 'var(--color-pastel-purple)', sub: ['Calm', 'Relaxed', 'Relieved', 'Serene'] },
};

interface EmotionWheelProps {
    selectedEmotions: string[];
    onToggleEmotion: (emotion: string) => void;
}

const EmotionWheel: React.FC<EmotionWheelProps> = ({ selectedEmotions, onToggleEmotion }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    return (
        <div className="w-full relative min-h-[160px]">
            <AnimatePresence mode="wait">
                {!activeCategory ? (
                    <motion.div
                        key="categories"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                        {Object.keys(emotionMap).map((cat) => (
                            <motion.button
                                key={cat}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveCategory(cat)}
                                style={{ backgroundColor: `color-mix(in srgb, ${emotionMap[cat].color} 20%, transparent)` }}
                                className="py-3 px-4 rounded-2xl flex flex-col items-center justify-center border border-[var(--color-border-subtle)] soft-shadow text-[var(--color-text-primary)] transition-all font-medium"
                            >
                                {cat}
                            </motion.button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="subemotions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-3 h-full"
                    >
                        <button
                            onClick={() => setActiveCategory(null)}
                            className="flex items-center text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors w-max"
                        >
                            <ChevronLeft className="w-3 h-3 mr-1" /> Back to Categories
                        </button>
                        <div className="flex flex-wrap gap-2">
                            {emotionMap[activeCategory].sub.map((emotion) => {
                                const isSelected = selectedEmotions.includes(emotion);
                                return (
                                    <motion.button
                                        key={emotion}
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => onToggleEmotion(emotion)}
                                        style={{
                                            backgroundColor: isSelected ? `color-mix(in srgb, ${emotionMap[activeCategory].color} 30%, transparent)` : 'transparent',
                                            borderColor: isSelected ? emotionMap[activeCategory].color : 'var(--color-border-subtle)'
                                        }}
                                        className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${isSelected
                                                ? 'text-[var(--color-text-primary)] shadow-sm'
                                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                                            }`}
                                    >
                                        {emotion}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmotionWheel;
