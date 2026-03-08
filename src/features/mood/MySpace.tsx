import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserEntries, JournalEntry } from '../journal/journalService';
import { getAchievements, Achievement } from '../../services/achievementService';
import AIInsightCard from '../../components/ui/InsightCard';
import AchievementBadge from '../../components/ui/AchievementBadge';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const MySpace = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [recentEntries, unlockedAchievements] = await Promise.all([
                    getUserEntries(user.uid, 42),
                    getAchievements(user.uid),
                ]);
                setEntries(recentEntries);
                setAchievements(unlockedAchievements);
            } catch (error) {
                console.error("Error fetching My Space data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
            </div>
        );
    }

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

    return (
        <motion.div className="space-y-8 pb-24 relative z-10" variants={containerVariants} initial="hidden" animate="show">
            <motion.header variants={itemVariants}>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-[var(--color-pastel-purple)]" /> My Space
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Your growth, insights, and achievements.</p>
            </motion.header>

            {/* ── 1. Sliding AI Insights Deck ── */}
            <motion.div variants={itemVariants} className="w-full">
                <AIInsightCard entries={entries} />
            </motion.div>

            {/* ── 2. Your Growth (Achievements) ── */}
            <motion.div variants={itemVariants}>
                <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none relative overflow-hidden glow-card">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div>
                            <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">Your Growth</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Badges you've earned along your journey.</p>
                        </div>
                        <Link to="/achievements" className="px-4 py-2 bg-[var(--color-bg-primary)]/80 backdrop-blur-md rounded-xl text-sm font-medium text-[var(--color-pastel-purple)] hover:bg-[var(--color-pastel-purple)]/10 border border-[var(--color-border-subtle)]/50 transition-colors flex items-center gap-2">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 relative z-10">
                        {achievements.slice(0, 12).map((achievement) => (
                            <AchievementBadge key={achievement.id} achievement={achievement} />
                        ))}
                        {achievements.length === 0 && (
                            <div className="col-span-full p-8 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl bg-[var(--color-bg-primary)]/30">
                                <span className="text-4xl block mb-3 opacity-50">🌱</span>
                                <p className="text-[var(--color-text-primary)] font-medium">No badges yet</p>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Keep checking in and journaling to unlock your first badge!</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MySpace;
