import { JournalEntry, getUserEntries } from '../features/journal/journalService';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    type: 'streak' | 'consistency' | 'depth' | 'wellness' | 'habit';
    unlockedAt?: string;
    isUnlocked?: boolean;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_entry', title: 'First Entry', description: 'Saved your first journal entry.', emoji: '🌱', type: 'consistency' },
    { id: 'three_day_streak', title: 'Getting Started', description: 'Journaled for 3 days in a row.', emoji: '🔥', type: 'streak' },
    { id: 'seven_day_streak', title: 'Weekly Warrior', description: 'Journaled for 7 days in a row.', emoji: '🌟', type: 'streak' },
    { id: 'thirty_entries', title: 'Dedicated', description: 'Logged 30 total entries.', emoji: '📚', type: 'consistency' },
    { id: 'mood_beginner', title: 'Mood Tracker Beginner', description: 'Logged your mood for the first time.', emoji: '🙂', type: 'depth' },
    { id: 'emotion_deep_dive', title: 'Emotion Deep Dive', description: 'Used AI Insights 5 times.', emoji: '🧠', type: 'depth' },
];

export const getAchievementsInfo = async (userId: string): Promise<Achievement[]> => {
    const entries = await getUserEntries(userId, 500);
    const achievements = ALL_ACHIEVEMENTS.map(a => ({ ...a, isUnlocked: false }));

    // Track dates logically
    const dates = new Set(entries.map(e => e.date));

    // Quick streak logic 
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

    // Evaluate
    achievements.forEach(ach => {
        if (ach.id === 'first_entry' && entries.length > 0) {
            ach.isUnlocked = true;
            ach.unlockedAt = entries[entries.length - 1].date;
        }
        if (ach.id === 'mood_beginner' && entries.length > 0) {
            ach.isUnlocked = true;
            ach.unlockedAt = entries[entries.length - 1].date;
        }
        if (ach.id === 'thirty_entries' && entries.length >= 30) {
            ach.isUnlocked = true;
            ach.unlockedAt = new Date().toISOString();
        }
        if (ach.id === 'three_day_streak' && currentStreak >= 3) {
            ach.isUnlocked = true;
            ach.unlockedAt = new Date().toISOString();
        }
        if (ach.id === 'seven_day_streak' && currentStreak >= 7) {
            ach.isUnlocked = true;
            ach.unlockedAt = new Date().toISOString();
        }
        const hasInsightsCount = entries.filter(e => e.aiAnalysisJson).length;
        if (ach.id === 'emotion_deep_dive' && hasInsightsCount >= 5) {
            ach.isUnlocked = true;
            ach.unlockedAt = new Date().toISOString();
        }
    });

    return achievements;
};

// Keep backwards compat for dashboard (returns only unlocked)
export const getAchievements = async (userId: string): Promise<Achievement[]> => {
    const all = await getAchievementsInfo(userId);
    return all.filter(a => a.isUnlocked);
};
