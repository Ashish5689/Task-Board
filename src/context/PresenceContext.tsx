import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { UserPresence } from '../types';
import { setupPresence, getOnlineUsers } from '../firebase/db';

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

  useEffect(() => {
    // Generate a unique ID for this user session
    const userId = localStorage.getItem('userId') || uuidv4();
    localStorage.setItem('userId', userId);
    setCurrentUserId(userId);

    // Set up presence monitoring
    const cleanupPresence = setupPresence(userId);

    // Get online users
    getOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    return () => {
      cleanupPresence();
    };
  }, []);

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
