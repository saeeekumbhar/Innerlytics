import React, { createContext, useContext, useEffect, useState } from 'react';

// Use a mock User type since we removed firebase/auth
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('innerlytics_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Mock Google Sign In
      const mockUser: User = {
        uid: "local-user-" + Math.floor(Math.random() * 10000),
        email: "localuser@innerlytics.test",
        displayName: "Local User"
      };

      localStorage.setItem('innerlytics_user', JSON.stringify(mockUser));
      setUser(mockUser);

      // Create user profile in Firestore if it doesn't exist
      const { createUserProfile } = await import('../services/userService');
      await createUserProfile(mockUser);
    } catch (error: any) {
      console.error("Error signing in", error);
      alert(`Sign-in failed: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('innerlytics_user');
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
