import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Flame, Check, Trash2, X } from 'lucide-react';
import { Habit, getHabits, addHabit, removeHabit, toggleHabitCompletion, getStreak } from '../../services/habitService';

const habitEmojis = ['🧘', '📖', '💧', '🏃', '🎨', '✍️', '🛌', '🥗', '🧠', '🎵', '💪', '🌿'];

const Habits = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmoji, setNewEmoji] = useState('🧘');
    const [celebrateId, setCelebrateId] = useState<string | null>(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        setHabits(getHabits());
    }, []);

    const handleAdd = () => {
        if (!newName.trim()) return;
        addHabit(newName.trim(), newEmoji);
        setHabits(getHabits());
        setNewName('');
        setNewEmoji('🧘');
        setShowAddForm(false);
    };

    const handleToggle = (id: string) => {
        const habit = habits.find(h => h.id === id);
        const wasCompleted = habit?.completedDates.includes(today);
        toggleHabitCompletion(id, today);
        setHabits(getHabits());
        // Celebrate if newly completed
        if (!wasCompleted) {
            setCelebrateId(id);
            setTimeout(() => setCelebrateId(null), 1500);
        }
    };

    const handleRemove = (id: string) => {
        removeHabit(id);
        setHabits(getHabits());
    };

    // Generate last 7 days for heatmap
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };
    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    };

    return (
        <motion.div className="space-y-8 pb-10 max-w-3xl mx-auto" variants={containerVariants} initial="hidden" animate="show">
            <motion.header variants={itemVariants} className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Habits</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Build consistency, one day at a time.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center px-5 py-3 bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-full font-medium transition-all duration-300 soft-shadow hover:shadow-lg hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" /> New Habit
                </button>
            </motion.header>

            {/* Add Habit Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">Add a new habit</h3>
                                <button onClick={() => setShowAddForm(false)} className="p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors">
                                    <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Meditate, Read, Drink water..."
                                    className="flex-1 px-5 py-3 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 text-[var(--color-text-primary)] focus:outline-none glow-focus placeholder:text-[var(--color-text-secondary)]/60"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Pick an icon</p>
                                <div className="flex flex-wrap gap-2">
                                    {habitEmojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setNewEmoji(emoji)}
                                            className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all duration-200 ${newEmoji === emoji ? 'bg-[var(--color-pastel-purple)]/20 ring-2 ring-[var(--color-pastel-purple)] scale-110' : 'hover:bg-[var(--color-pastel-hover)] border border-[var(--color-border-subtle)]/50'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleAdd} disabled={!newName.trim()} className="w-full py-3.5 text-white rounded-full font-medium bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] hover:scale-[1.02] active:scale-95 transition-all duration-300 soft-shadow disabled:opacity-40">
                                Add Habit ✨
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Habit List */}
            {habits.length === 0 ? (
                <motion.div variants={itemVariants} className="glass rounded-[2rem] p-12 soft-shadow border-none text-center">
                    <p className="text-5xl mb-4">🌱</p>
                    <p className="text-[var(--color-text-secondary)] text-lg">No habits yet. Start building your daily rituals!</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {habits.map(habit => {
                        const streak = getStreak(habit);
                        const isCompletedToday = habit.completedDates.includes(today);
                        const isCelebrating = celebrateId === habit.id;

                        return (
                            <motion.div
                                key={habit.id}
                                variants={itemVariants}
                                className="glass rounded-[2rem] p-5 lg:p-6 soft-shadow border-none relative overflow-hidden"
                            >
                                {/* Celebration effect */}
                                {isCelebrating && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 1 }}
                                        animate={{ scale: 3, opacity: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute inset-0 bg-[var(--color-pastel-teal)]/20 rounded-full m-auto w-20 h-20 pointer-events-none z-0"
                                    />
                                )}

                                <div className="flex items-center gap-4 relative z-10">
                                    {/* Check button */}
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => handleToggle(habit.id)}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 border-2 ${isCompletedToday
                                            ? 'bg-[var(--color-pastel-teal)] border-[var(--color-pastel-teal)] text-white shadow-md'
                                            : 'border-[var(--color-border-subtle)] hover:border-[var(--color-pastel-teal)] hover:bg-[var(--color-pastel-teal)]/10'
                                            }`}
                                    >
                                        {isCompletedToday ? <Check className="w-6 h-6" /> : <span className="text-xl">{habit.emoji}</span>}
                                    </motion.button>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-lg ${isCompletedToday ? 'line-through opacity-60' : ''} text-[var(--color-text-primary)]`}>
                                            {habit.emoji} {habit.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            {streak > 0 && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-pastel-peach)]">
                                                    <Flame className="w-3.5 h-3.5" /> {streak} day streak
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Weekly heatmap */}
                                    <div className="hidden md:flex gap-1">
                                        {last7Days.map(day => (
                                            <div
                                                key={day}
                                                className={`w-6 h-6 rounded-lg transition-colors ${habit.completedDates.includes(day)
                                                    ? 'bg-[var(--color-pastel-teal)]'
                                                    : 'bg-[var(--color-border-subtle)]/30'
                                                    }`}
                                                title={day}
                                            />
                                        ))}
                                    </div>

                                    {/* Delete */}
                                    <button onClick={() => handleRemove(habit.id)} className="p-2 rounded-full hover:bg-[var(--color-danger)]/10 transition-colors opacity-40 hover:opacity-100">
                                        <Trash2 className="w-4 h-4 text-[var(--color-danger)]" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default Habits;
