import { collection, addDoc, query, where, getDocs, doc, setDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface LifeTrackerEntry {
    id?: string;
    userId: string;
    date: string; // YYYY-MM-DD
    ratings: Record<string, number>;
    updatedAt: string;
}

export const getLifeTrackerEntry = async (userId: string, date: string): Promise<LifeTrackerEntry | null> => {
    const q = query(
        collection(db, 'lifeTracker'),
        where('userId', '==', userId),
        where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as LifeTrackerEntry;
};

export const saveLifeTrackerEntry = async (entry: Omit<LifeTrackerEntry, 'id' | 'updatedAt'>) => {
    const existing = await getLifeTrackerEntry(entry.userId, entry.date);
    const payload = { ...entry, updatedAt: new Date().toISOString() };

    if (existing && existing.id) {
        const docRef = doc(db, 'lifeTracker', existing.id);
        await setDoc(docRef, payload, { merge: true });
        return existing.id;
    } else {
        const docRef = await addDoc(collection(db, 'lifeTracker'), payload);
        return docRef.id;
    }
};

export const getRecentLifeTrackerEntries = async (userId: string, limitDays: number = 7): Promise<LifeTrackerEntry[]> => {
    // Try getting all for user and sorting in memory to avoid needing complex composite indexes
    const q = query(
        collection(db, 'lifeTracker'),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    let entries: LifeTrackerEntry[] = [];

    snapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() } as LifeTrackerEntry);
    });

    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return entries.slice(0, limitDays);
};
