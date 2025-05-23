import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { UserPresence } from '../types';
import { setupPresence, getOnlineUsers } from '../firebase/db';
import { useAuth } from './AuthContext';

interface PresenceContextProps {
  onlineUsers: UserPresence[];
  currentUserId: string;
}

const PresenceContext = createContext<PresenceContextProps | undefined>(undefined);

export const usePresenceContext = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresenceContext must be used within a PresenceProvider');
  }
  return context;
};

interface PresenceProviderProps {
  children: ReactNode;
}

export const PresenceProvider = ({ children }: PresenceProviderProps) => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { authState } = useAuth();
  const { user } = authState;

  useEffect(() => {
    // Use authenticated user ID if available, otherwise generate a unique ID
    const userId = user?.uid || localStorage.getItem('userId') || uuidv4();
    
    // Only store in localStorage if not authenticated
    if (!user?.uid) {
      localStorage.setItem('userId', userId);
    }
    
    setCurrentUserId(userId);

    // Set up presence monitoring with user profile info if available
    const cleanupPresence = setupPresence(
      userId,
      user?.displayName,
      user?.photoURL
    );

    // Get online users
    getOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    return () => {
      cleanupPresence();
    };
  }, [user]);

  const value = {
    onlineUsers,
    currentUserId
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};
