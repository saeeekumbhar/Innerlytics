import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export interface ImportantDay {
    id?: string;
    userId: string;
    date: string; // YYYY-MM-DD
    title: string;
    type: 'birthday' | 'exam' | 'trip' | 'anniversary' | 'achievement' | 'other';
}

export const getImportantDays = async (userId: string): Promise<ImportantDay[]> => {
    const q = query(collection(db, 'importantDays'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImportantDay));
};

export const addImportantDay = async (day: Omit<ImportantDay, 'id'>) => {
    const docRef = await addDoc(collection(db, 'importantDays'), day);
    return docRef.id;
};

export const deleteImportantDay = async (id: string) => {
    await deleteDoc(doc(db, 'importantDays', id));
};
