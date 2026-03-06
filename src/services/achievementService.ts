import { JournalEntry, getUserEntries } from '../features/journal/journalService';
import { Habit, getHabits } from './habitService';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    unlockedAt?: string;
    type: 'streak' | 'consistency' | 'depth' | 'wellness' | 'habit';
}

const ALL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_step', title: 'First Step', description: 'Saved your first journal entry.', emoji: '🌱', type: 'consistency' },
    { id: 'seven_day_streak', title: 'Weekly Warrior', description: 'Journaled for 7 days in a row.', emoji: '🔥', type: 'streak' },
    { id: 'mood_architect', title: 'Mood Architect', description: 'Logged 10 multi-dimensional entries.', emoji: '🏛️', type: 'depth' },
    { id: 'habit_hero', title: 'Habit Hero', description: 'Maintained a 5-day habit streak.', emoji: '🏆', type: 'habit' },
    { id: 'zen_master', title: 'Zen Master', description: 'Used wellness tools 10 times.', emoji: '🧘', type: 'wellness' },
    { id: 'reflection_pro', title: 'Deep Reflection', description: 'Average journal entry length over 100 words.', emoji: '✍️', type: 'depth' },
];

export const getAchievements = async (userId: string): Promise<Achievement[]> => {
    const entries = await getUserEntries(userId, 100);
    const habits = getHabits();

    const unlocked: Achievement[] = [];

    // 1. First Step
    if (entries.length > 0) {
        unlocked.push({ ...ALL_ACHIEVEMENTS[0], unlockedAt: entries[entries.length - 1].createdAt });
    }

    // 2. 7-Day Streak
    let currentStreak = 0;
    if (entries.length >= 7) {
        const dates = new Set(entries.map(e => e.date));
        let checkDate = new Date();
        for (let i = 0; i < 30; i++) {
            const dStr = checkDate.toISOString().split('T')[0];
            if (dates.has(dStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (i === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
            } else {
                break;
            }
        }
        if (currentStreak >= 7) {
            unlocked.push({ ...ALL_ACHIEVEMENTS[1], unlockedAt: new Date().toISOString() });
        }
    }

    // 3. Mood Architect
    const multiDimCount = entries.filter(e => e.energyLevel !== undefined).length;
    if (multiDimCount >= 10) {
        unlocked.push({ ...ALL_ACHIEVEMENTS[2], unlockedAt: new Date().toISOString() });
    }

    // 4. Habit Hero
    const maxHabitStreak = Math.max(0, ...habits.map(h => {
        // Basic streak calculation if not available in habits.ts
        return 0; // Placeholder until streak logic is expanded
    }));
    // Note: habits.ts already has getStreak, but use it here if needed.

    // For now, let's keep it simple and return the list
    return unlocked;
};
