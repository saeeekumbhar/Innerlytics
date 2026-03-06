import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getUserEntries } from '../../features/journal/journalService';
import { useAuth } from '../../context/AuthContext';

const EmotionAvatar = () => {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const fetchStreak = async () => {
            if (!user) return;
            const entries = await getUserEntries(user.uid, 50);
            const dates = new Set(entries.map(e => e.date));
            let currentStreak = 0;
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
                const dStr = checkDate.toISOString().split('T')[0];
                if (dates.has(dStr)) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (i === 0 && Array.from(dates).includes(dStr) === false) {
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
            setStreak(currentStreak);
        };
        fetchStreak();
    }, [user]);

    // Determine avatar state based on streak
    let color = 'from-[var(--color-bg-secondary)] to-[var(--color-border-subtle)]';
    let animation: any = { y: [0, 2, 0], transition: { duration: 3, repeat: Infinity } };
    let face = '😴';
    let message = "I'm sleeping... journal to wake me up!";

    if (streak > 0 && streak < 3) {
        color = 'from-[var(--color-pastel-peach)]/50 to-[var(--color-pastel-yellow)]/50';
        animation = { y: [0, -5, 0], transition: { duration: 2, repeat: Infinity } };
        face = '🙂';
        message = "I'm waking up! Keep the streak going.";
    } else if (streak >= 3) {
        color = 'from-[var(--color-pastel-pink)]/60 to-[var(--color-pastel-teal)]/60';
        animation = { y: [0, -10, 0], scale: [1, 1.05, 1], transition: { duration: 1.5, repeat: Infinity } };
        face = '✨🥰✨';
        message = "I'm thriving! Great job on your streak!";
    }

    return (
        <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none flex flex-col items-center text-center relative overflow-hidden">
            <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-6">Your Inner Sprite</h3>
            <motion.div
                animate={animation as any}
                className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-4xl shadow-inner border border-white/20`}
            >
                {face}
            </motion.div>
            <div className="mt-6 flex flex-col items-center">
                <div className="px-3 py-1 bg-[var(--color-bg-primary)] rounded-full text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 soft-shadow-sm border border-[var(--color-border-subtle)]">
                    Streak: {streak} 🔥
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)] max-w-[200px]">{message}</p>
            </div>
        </div>
    );
};

export default EmotionAvatar;
