import React from 'react';
import { motion } from 'motion/react';
import { Achievement } from './achievementService';

interface Props {
    achievement: Achievement;
    isLocked?: boolean;
    key?: string | number;
}

const AchievementBadge: React.FC<Props> = ({ achievement, isLocked = false }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={`glass rounded-2xl p-4 flex items-center gap-4 border-none soft-shadow relative overflow-hidden transition-opacity duration-500 ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}`}
        >
            {!isLocked && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-pastel-purple)]/10 rounded-full blur-xl -mt-6 -mr-6 pointer-events-none" />
            )}

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isLocked ? 'bg-[var(--color-bg-primary)]' : 'bg-[var(--color-pastel-purple)]/20'}`}>
                {achievement.emoji}
            </div>

            <div className="min-w-0">
                <h4 className="text-sm font-bold text-[var(--color-text-primary)] truncate">{achievement.title}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">{achievement.description}</p>
                {!isLocked && achievement.unlockedAt && (
                    <p className="text-[10px] text-[var(--color-pastel-teal)] font-bold mt-1 uppercase tracking-wider">Unlocked</p>
                )}
            </div>
        </motion.div>
    );
};

export default AchievementBadge;
