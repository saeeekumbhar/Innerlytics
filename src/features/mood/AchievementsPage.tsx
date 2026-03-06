import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAchievementsInfo, Achievement } from '../../services/achievementService';
import { motion } from 'motion/react';
import { Trophy, Lock, Sparkles } from 'lucide-react';

const AchievementsPage = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchs = async () => {
            if (!user) return;
            try {
                const data = await getAchievementsInfo(user.uid);
                setAchievements(data);
            } catch (error) {
                console.error("Error fetching achievements:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAchs();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full pb-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10 space-y-8">
            <header>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                    Achievements <Trophy className="w-8 h-8 text-[var(--color-pastel-yellow)]" />
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Your journey and milestones in self-reflection.</p>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {achievements.map((ach) => (
                    <motion.div
                        key={ach.id}
                        variants={itemVariants}
                        className={`p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden relative ${ach.isUnlocked
                                ? 'bg-[var(--color-bg-primary)]/80 border-[var(--color-pastel-purple)]/30 soft-shadow glass'
                                : 'bg-[var(--color-border-subtle)]/10 border-transparent filter grayscale opacity-60'
                            }`}
                    >
                        {ach.isUnlocked && (
                            <>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-yellow)]/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
                                <Sparkles className="absolute top-4 right-4 w-4 h-4 text-[var(--color-pastel-yellow)] animate-pulse" />
                            </>
                        )}

                        <div className="flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-sm mb-4 ${ach.isUnlocked ? 'bg-gradient-to-br from-white/60 to-white/20' : 'bg-black/5'}`}>
                                {ach.emoji}
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)] font-serif">{ach.title}</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-2 font-medium">{ach.description}</p>

                            {ach.isUnlocked ? (
                                <div className="mt-4 px-3 py-1 bg-[var(--color-pastel-teal)]/20 text-[var(--color-pastel-teal)] rounded-full text-xs font-bold uppercase tracking-wider">
                                    Unlocked
                                </div>
                            ) : (
                                <div className="mt-4 px-3 py-1 bg-black/10 text-[var(--color-text-secondary)] rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                                    <Lock className="w-3 h-3" /> Locked
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default AchievementsPage;
