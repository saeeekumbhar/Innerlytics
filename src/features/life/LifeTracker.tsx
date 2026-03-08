import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLifeTrackerEntry, saveLifeTrackerEntry } from '../../services/lifeTrackerService';
import { Moon, Heart, Palette, Coffee, Users, TrendingUp, CheckSquare, Briefcase, Sun, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';

export const categories = [
    { id: 'sleep', name: 'Sleep', icon: Moon, color: 'text-[var(--color-pastel-blue)]', bg: 'bg-[var(--color-pastel-blue)]/20' },
    { id: 'health', name: 'Health', icon: Heart, color: 'text-[var(--color-danger)]', bg: 'bg-[var(--color-danger)]/20' },
    { id: 'hobbies', name: 'Hobbies', icon: Palette, color: 'text-[var(--color-pastel-purple)]', bg: 'bg-[var(--color-pastel-purple)]/20' },
    { id: 'food', name: 'Food', icon: Coffee, color: 'text-[var(--color-pastel-peach)]', bg: 'bg-[var(--color-pastel-peach)]/20' },
    { id: 'social', name: 'Social Life', icon: Users, color: 'text-[var(--color-pastel-teal)]', bg: 'bg-[var(--color-pastel-teal)]/20' },
    { id: 'self_improvement', name: 'Self Improvement', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
    { id: 'chores', name: 'Chores', icon: CheckSquare, color: 'text-[var(--color-text-secondary)]', bg: 'bg-[var(--color-border-subtle)]' },
    { id: 'work', name: 'School / Work', icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-400/20' },
    { id: 'weather', name: 'Weather', icon: Sun, color: 'text-[var(--color-pastel-yellow)]', bg: 'bg-[var(--color-pastel-yellow)]/30' },
    { id: 'beauty', name: 'Beauty / Self Care', icon: Sparkles, color: 'text-[var(--color-pastel-pink)]', bg: 'bg-[var(--color-pastel-pink)]/20' },
];

const LifeTracker = () => {
    const { user } = useAuth();
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchEntry = async () => {
            if (!user) return;
            const entry = await getLifeTrackerEntry(user.uid, today);
            if (entry) {
                setRatings(entry.ratings);
            }
            setLoading(false);
        };
        fetchEntry();
    }, [user, today]);

    const handleRate = (categoryId: string, starIndex: number) => {
        setRatings(prev => ({
            ...prev,
            [categoryId]: starIndex
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        await saveLifeTrackerEntry({
            userId: user.uid,
            date: today,
            ratings
        });
        setTimeout(() => setSaving(false), 1000); // UI feedback
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-3xl mx-auto pb-10 space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)] relative inline-block">
                        Life Tracker
                        <Sparkles className="absolute -top-4 -right-6 w-5 h-5 text-[var(--color-pastel-teal)] animate-pulse" />
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Track the subtle aspects of your daily life.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full font-medium text-white transition-all bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] soft-shadow hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {saving ? 'Saved ✨' : 'Save Trackers'}
                </button>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none grid grid-cols-1 md:grid-cols-2 gap-4 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-pastel-pink)]/5 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>

                {categories.map((cat) => (
                    <motion.div key={cat.id} variants={itemVariants} className="p-4 bg-[var(--color-bg-primary)]/40 hover:bg-[var(--color-pastel-hover)] rounded-2xl border border-[var(--color-border-subtle)]/50 transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg}`}>
                                <cat.icon className={`w-5 h-5 ${cat.color}`} />
                            </div>
                            <span className="font-medium text-[var(--color-text-primary)]">{cat.name}</span>
                        </div>

                        <div className="flex gap-1 group-hover:scale-105 transition-transform">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isActive = (ratings[cat.id] || 0) >= star;
                                return (
                                    <button
                                        key={star}
                                        onClick={() => handleRate(cat.id, star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-6 h-6 transition-all duration-300 ${isActive ? 'fill-[var(--color-pastel-yellow)] text-[var(--color-pastel-yellow)] scale-110 drop-shadow-sm' : 'text-[var(--color-border-subtle)] hover:text-[var(--color-pastel-teal)]'}`}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default LifeTracker;
