import { User } from '../context/AuthContext';

export const createUserProfile = async (user: User) => {
  const usersStr = localStorage.getItem('innerlytics_users');
  const users = usersStr ? JSON.parse(usersStr) : {};

  if (!users[user.uid]) {
    try {
      users[user.uid] = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('innerlytics_users', JSON.stringify(users));
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const usersStr = localStorage.getItem('innerlytics_users');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      if (users[userId]) {
        return users[userId];
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};
