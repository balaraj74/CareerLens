
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { useFirebase } from '@/lib/use-firebase'; 

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  googleSignIn: () => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  googleSignIn: async () => {},
  logOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useFirebase(); 
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service not available");
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const signIn = (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service not available");
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const googleSignIn = async () => {
    if (!auth) throw new Error("Auth service not available");
      const provider = new GoogleAuthProvider();
      return signInWithPopup(auth, provider);
  }

  const logOut = () => {
    if (!auth) throw new Error("Auth service not available");
    return signOut(auth);
  };

  useEffect(() => {
    if (!auth) {
        // Set loading to false only if auth is explicitly null after attempting to initialize
        if (auth === null) {
            setLoading(false);
        }
        return;
    };
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, googleSignIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
