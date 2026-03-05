export interface PartnerConnection {
  id?: string;
  requesterId: string;
  partnerId: string; // In a real app, this might be email initially until they join
  partnerEmail?: string;
  permissionLevel: 'private' | 'selected_entries' | 'mood_summary' | 'full_access';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

const getStoredPartners = (): PartnerConnection[] => {
  const stored = localStorage.getItem('innerlytics_partners');
  return stored ? JSON.parse(stored) : [];
};

const savePartners = (partners: PartnerConnection[]) => {
  localStorage.setItem('innerlytics_partners', JSON.stringify(partners));
};

export const sendPartnerRequest = async (requesterId: string, partnerEmail: string) => {
  try {
    const partners = getStoredPartners();

    // Check if request already exists
    const existing = partners.find(p => p.requesterId === requesterId && p.partnerEmail === partnerEmail);
    if (existing) {
      throw new Error("Request already sent to this email.");
    }

    const newConnection: PartnerConnection = {
      id: Math.random().toString(36).substring(7),
      requesterId,
      partnerEmail,
      partnerId: '', // Unknown yet
      permissionLevel: 'mood_summary', // Default
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    partners.push(newConnection);
    savePartners(partners);

  } catch (error) {
    console.error("Error sending partner request:", error);
    throw error;
  }
};

export const getPartnerConnections = async (userId: string) => {
  try {
    const partners = getStoredPartners();

    // Get requests sent by user
    const sent = partners.filter(p => p.requesterId === userId);

    return sent;
  } catch (error) {
    console.error("Error getting partner connections:", error);
    throw error;
  }
};
