export interface LifeTrackerEntry {
    id?: string;
    userId: string;
    date: string; // YYYY-MM-DD
    ratings: Record<string, number>;
    updatedAt: string;
}

const getStoredEntries = (): LifeTrackerEntry[] => {
    const stored = localStorage.getItem('innerlytics_lifetracker');
    return stored ? JSON.parse(stored) : [];
};

const saveStoredEntries = (entries: LifeTrackerEntry[]) => {
    localStorage.setItem('innerlytics_lifetracker', JSON.stringify(entries));
};

export const getLifeTrackerEntry = async (userId: string, date: string): Promise<LifeTrackerEntry | null> => {
    const entries = getStoredEntries();
    return entries.find(e => e.userId === userId && e.date === date) || null;
};

export const saveLifeTrackerEntry = async (entry: Omit<LifeTrackerEntry, 'id' | 'updatedAt'>) => {
    const entries = getStoredEntries();
    const existingIndex = entries.findIndex(e => e.userId === entry.userId && e.date === entry.date);

    const payload: LifeTrackerEntry = {
        ...entry,
        id: existingIndex >= 0 ? entries[existingIndex].id : Math.random().toString(36).substring(7),
        updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        entries[existingIndex] = payload;
    } else {
        entries.push(payload);
    }

    saveStoredEntries(entries);
    return payload.id;
};

export const getRecentLifeTrackerEntries = async (userId: string, limitDays: number = 7): Promise<LifeTrackerEntry[]> => {
    const entries = getStoredEntries()
        .filter(e => e.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limitDays);
    return entries;
};
