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
        <motion.div className="space-y-8 pb-32 max-w-4xl mx-auto px-4 lg:px-0" variants={containerVariants} initial="hidden" animate="show">
            <motion.header variants={itemVariants} className="flex justify-between items-end my-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Habits</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Build consistency, one day at a time.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-[#94b5ff] to-[#7f9cf8] text-[var(--color-bg-primary)] rounded-full font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-1.5 stroke-[3]" /> New Habit
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
                        <div className="bg-[var(--color-bg-card)] rounded-[2rem] p-6 lg:p-8 shadow-sm border border-[var(--color-border-subtle)] space-y-5 mb-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">Add a new habit</h3>
                                <button onClick={() => setShowAddForm(false)} className="p-2 rounded-full hover:bg-[var(--color-bg-primary)] transition-colors">
                                    <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Meditate, Read, Drink water..."
                                    className="flex-1 px-5 py-3 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none glow-focus placeholder:text-[var(--color-text-secondary)]/60"
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
                                            className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all duration-200 ${newEmoji === emoji ? 'bg-[#94b5ff]/20 ring-2 ring-[#94b5ff] scale-110' : 'hover:bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]/50'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleAdd} disabled={!newName.trim()} className="w-full py-3.5 text-[var(--color-bg-primary)] rounded-full font-bold bg-gradient-to-r from-[#94b5ff] to-[#7f9cf8] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-md disabled:opacity-40">
                                Add Habit ✨
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Habit List */}
            {habits.length === 0 ? (
                <motion.div variants={itemVariants} className="bg-[var(--color-bg-card)] rounded-[2rem] p-12 shadow-sm border border-[var(--color-border-subtle)] text-center mt-10">
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
                                className="bg-[#1C1C24] dark:bg-[#16161D] rounded-[2rem] p-4 lg:p-5 border border-white/5 relative overflow-hidden flex items-center shadow-lg"
                            >
                                {/* Celebration effect */}
                                {isCelebrating && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 1 }}
                                        animate={{ scale: 3, opacity: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute left-6 bg-[#4ade80]/30 rounded-full w-12 h-12 pointer-events-none z-0"
                                    />
                                )}

                                <div className="flex items-center justify-between w-full relative z-10 gap-4">

                                    {/* Left side: Check button and Info */}
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Check button */}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleToggle(habit.id)}
                                            className={`w-14 h-14 shrink-0 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 border-2 ${isCompletedToday
                                                ? 'bg-[#4ade80] border-[#4ade80] text-gray-900 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                                                : 'border-white/10 hover:border-white/20 bg-white/5 text-gray-300'
                                                }`}
                                        >
                                            {isCompletedToday ? <Check className="w-7 h-7 stroke-[3]" /> : <span className="text-xl font-bold opacity-0 hover:opacity-100"><Check className="w-7 h-7 opacity-50 stroke-[3]" /></span>}
                                        </motion.button>

                                        {/* Info */}
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <p className={`font-bold text-lg md:text-xl truncate transition-colors ${isCompletedToday ? 'text-white/40 line-through' : 'text-gray-200'}`}>
                                                {habit.emoji} {habit.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-[#ff9d76]' : 'text-gray-600'}`} />
                                                <span className={`text-sm font-bold ${streak > 0 ? 'text-[#ff9d76]' : 'text-gray-600'}`}>
                                                    {streak} day streak
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: Heatmap and Delete */}
                                    <div className="flex items-center gap-4 md:gap-6 shrink-0 ml-auto">
                                        {/* Weekly heatmap - visible on all screens, just scaled down on mobile */}
                                        <div className="flex flex-col gap-1 items-end pt-1">
                                            {/* Days Label Header */}
                                            <div className="flex gap-1.5 md:gap-2">
                                                {last7Days.map((day, i) => (
                                                    <div key={`lbl-${i}`} className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-gray-500 uppercase">
                                                        {new Date(day).toLocaleDateString('en-US', { weekday: 'narrow' })}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Dots Box */}
                                            <div className="flex gap-1.5 md:gap-2">
                                                {last7Days.map(day => {
                                                    const isDone = habit.completedDates.includes(day);
                                                    return (
                                                        <div
                                                            key={day}
                                                            className={`w-4 h-4 md:w-5 md:h-5 rounded-md transition-colors ${isDone
                                                                ? 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.4)]'
                                                                : 'bg-white/5'
                                                                }`}
                                                            title={day}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <motion.button
                                            whileHover={{ scale: 1.15 }}
                                            onClick={() => handleRemove(habit.id)}
                                            className="p-2 rounded-xl hover:bg-red-500/10 transition-colorstext-gray-500 hover:text-red-400 opacity-50 hover:opacity-100"
                                            title="Delete Habit"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-500/60 hover:text-red-500" />
                                        </motion.button>
                                    </div>

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
