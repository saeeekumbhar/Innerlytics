import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

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

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'journal_entries'), {
      ...entry,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding journal entry: ", error);
    throw error;
  }
};

export const getUserEntries = async (userId: string, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'journal_entries'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
  } catch (error) {
    console.error("Error getting user entries: ", error);
    throw error;
  }
};

export const getTodayEntry = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const q = query(
      collection(db, 'journal_entries'),
      where('userId', '==', userId),
      where('date', '==', today),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as JournalEntry;
    }
    return null;
  } catch (error) {
    console.error("Error getting today's entry: ", error);
    throw error;
  }
};
