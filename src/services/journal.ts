export interface JournalEntry {
  id?: string;
  userId: string;
  date: string;
  moodScore: number;
  moodLabel: string;
  content: string;
  aiAnalysisJson?: string;
  sharedWith?: string[];
  createdAt: any;
}

const getStoredEntries = (): JournalEntry[] => {
  const stored = localStorage.getItem('innerlytics_journals');
  return stored ? JSON.parse(stored) : [];
};

const saveEntries = (entries: JournalEntry[]) => {
  localStorage.setItem('innerlytics_journals', JSON.stringify(entries));
};

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
  try {
    const entries = getStoredEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    };

    entries.push(newEntry);
    saveEntries(entries);

    return newEntry.id;
  } catch (error) {
    console.error("Error adding journal entry: ", error);
    throw error;
  }
};

export const getUserEntries = async (userId: string, limitCount = 50) => {
  try {
    const entries = getStoredEntries();
    const userEntries = entries
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limitCount);

    return userEntries;
  } catch (error) {
    console.error("Error getting user entries: ", error);
    throw error;
  }
};

export const getTodayEntry = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const entries = getStoredEntries();
    const todayEntry = entries.find(e => e.userId === userId && e.date === today);
    return todayEntry || null;
  } catch (error) {
    console.error("Error getting today's entry: ", error);
    throw error;
  }
};
