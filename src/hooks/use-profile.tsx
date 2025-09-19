'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { getOrCreateUserProfile } from '@/lib/profile-service';
import { useToast } from './use-toast';

interface ProfileContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  reloadProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  user: null,
  profile: null,
  loading: true,
  reloadProfile: async () => {},
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const userProfile = await getOrCreateUserProfile(user);
      setProfile(userProfile);
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      toast({
        variant: "destructive",
        title: "Failed to load profile",
        description: error.message || "Could not fetch your profile data.",
      });
      // Set to null on error to avoid using stale data.
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    // Only run loadProfile if auth is resolved and we have a user.
    if (!authLoading) {
      loadProfile();
    }
  }, [authLoading, user, loadProfile]);
  
  const reloadProfile = async () => {
    await loadProfile();
  }

  // The context value now provides the combined state.
  const value = {
    user,
    profile,
    loading: authLoading || loading,
    reloadProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};
