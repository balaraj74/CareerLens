import { create } from 'zustand';
import { type User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
  role: string;
  targetRole?: string;
  currentSkills?: string[];
  experienceLevel?: string;
  careerScore?: number;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}));
export default useAuthStore;
