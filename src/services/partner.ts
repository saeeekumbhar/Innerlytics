import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface PartnerConnection {
  id?: string;
  requesterId: string;
  partnerId: string; // In a real app, this might be email initially until they join
  partnerEmail?: string;
  permissionLevel: 'private' | 'selected_entries' | 'mood_summary' | 'full_access';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export const sendPartnerRequest = async (requesterId: string, partnerEmail: string) => {
  try {
    // Check if request already exists
    const q = query(
      collection(db, 'partner_connections'),
      where('requesterId', '==', requesterId),
      where('partnerEmail', '==', partnerEmail)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("Request already sent to this email.");
    }

    await addDoc(collection(db, 'partner_connections'), {
      requesterId,
      partnerEmail,
      partnerId: '', // Unknown yet
      permissionLevel: 'mood_summary', // Default
      status: 'pending',
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error sending partner request:", error);
    throw error;
  }
};

export const getPartnerConnections = async (userId: string) => {
  try {
    // Get requests sent by user
    const sentQuery = query(collection(db, 'partner_connections'), where('requesterId', '==', userId));
    const sentSnap = await getDocs(sentQuery);
    
    // Get requests received by user (need to match email, but for MVP let's assume we can query by partnerId if set, or email)
    // This is tricky without a backend to resolve email to uid securely.
    // For MVP, we'll just show sent requests.
    
    return sentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerConnection));
  } catch (error) {
    console.error("Error getting partner connections:", error);
    throw error;
  }
};
