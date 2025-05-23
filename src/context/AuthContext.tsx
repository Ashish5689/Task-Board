import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';
import type { User, AuthState } from '../types';

interface AuthContextProps {
  authState: AuthState;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName?: string, photoFile?: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from database or create if doesn't exist
        const user = await getUserData(firebaseUser);
        setAuthState({
          user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const getUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = ref(db, `users/${firebaseUser.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as User;
    } else {
      // Create new user in database
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous User',
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date().toISOString(),
      };
      
      await set(userRef, newUser);
      return newUser;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName,
      });
      
      // User data will be created by the onAuthStateChanged listener
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error as Error).message 
      }));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
      // User data will be set by the onAuthStateChanged listener
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error as Error).message 
      }));
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User data will be set by the onAuthStateChanged listener
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error as Error).message 
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
      // User data will be cleared by the onAuthStateChanged listener
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error as Error).message 
      }));
      throw error;
    }
  };

  const updateUserProfile = async (displayName?: string, photoFile?: File) => {
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');
      
      let photoURL = auth.currentUser.photoURL || '';
      
      // Upload photo if provided
      if (photoFile) {
        const fileRef = storageRef(storage, `user-avatars/${auth.currentUser.uid}`);
        await uploadBytes(fileRef, photoFile);
        photoURL = await getDownloadURL(fileRef);
      }
      
      // Update Firebase Auth profile
      const updateData: { displayName?: string; photoURL?: string } = {};
      if (displayName) updateData.displayName = displayName;
      if (photoURL) updateData.photoURL = photoURL;
      
      await updateProfile(auth.currentUser, updateData);
      
      // Update user in database
      if (auth.currentUser) {
        const userRef = ref(db, `users/${auth.currentUser.uid}`);
        await set(userRef, {
          ...(authState.user || {}),
          displayName: displayName || auth.currentUser.displayName,
          photoURL,
          updatedAt: new Date().toISOString(),
        });
        
        // Update auth state
        if (authState.user) {
          setAuthState({
            ...authState,
            user: {
              ...authState.user,
              displayName: displayName || authState.user.displayName,
              photoURL,
            },
          });
        }
      }
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: (error as Error).message 
      }));
      throw error;
    }
  };

  const value = {
    authState,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
