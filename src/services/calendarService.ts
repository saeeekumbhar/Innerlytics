export interface ImportantDay {
    id?: string;
    userId: string;
    date: string; // YYYY-MM-DD
    title: string;
    type: 'birthday' | 'exam' | 'trip' | 'anniversary' | 'achievement' | 'other';
}

const getStoredDays = (): ImportantDay[] => {
    const stored = localStorage.getItem('innerlytics_importantdays');
    return stored ? JSON.parse(stored) : [];
};

const saveStoredDays = (days: ImportantDay[]) => {
    localStorage.setItem('innerlytics_importantdays', JSON.stringify(days));
};

export const getImportantDays = async (userId: string): Promise<ImportantDay[]> => {
    return getStoredDays().filter(d => d.userId === userId);
};

export const addImportantDay = async (day: Omit<ImportantDay, 'id'>) => {
    const days = getStoredDays();
    const newDay: ImportantDay = {
        ...day,
        id: Math.random().toString(36).substring(7)
    };
    days.push(newDay);
    saveStoredDays(days);
    return newDay.id;
};

export const deleteImportantDay = async (id: string) => {
    const days = getStoredDays().filter(d => d.id !== id);
    saveStoredDays(days);
};
