export interface Habit {
    id: string;
    name: string;
    emoji: string;
    frequency: 'daily' | 'weekly';
    completedDates: string[];
    createdAt: string;
}

const STORAGE_KEY = 'innerlytics_habits';

const getStoredHabits = (): Habit[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveHabits = (habits: Habit[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

export const getHabits = (): Habit[] => getStoredHabits();

export const addHabit = (name: string, emoji: string, frequency: 'daily' | 'weekly' = 'daily'): Habit => {
    const habits = getStoredHabits();
    const newHabit: Habit = {
        id: Math.random().toString(36).substring(7),
        name,
        emoji,
        frequency,
        completedDates: [],
        createdAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    saveHabits(habits);
    return newHabit;
};

export const removeHabit = (id: string) => {
    const habits = getStoredHabits().filter(h => h.id !== id);
    saveHabits(habits);
};

export const toggleHabitCompletion = (id: string, date: string): Habit | undefined => {
    const habits = getStoredHabits();
    const habit = habits.find(h => h.id === id);
    if (!habit) return undefined;

    if (habit.completedDates.includes(date)) {
        habit.completedDates = habit.completedDates.filter(d => d !== date);
    } else {
        habit.completedDates.push(date);
    }

    saveHabits(habits);
    return habit;
};

export const getStreak = (habit: Habit): number => {
    const today = new Date();
    let streak = 0;
    const checkDate = new Date(today);

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (habit.completedDates.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // Allow today to not be completed yet
            if (streak === 0 && dateStr === today.toISOString().split('T')[0]) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
            }
            break;
        }
    }
    return streak;
};
