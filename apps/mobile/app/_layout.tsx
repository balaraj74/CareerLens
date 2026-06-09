import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../src/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore, type UserProfile } from '../src/store/useAuthStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLORS, GRADIENTS } from '../src/theme/colors';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { setUser, setProfile, setLoading, user, loading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [fontLoaded, setFontLoaded] = useState(true); // Default system fonts

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user profile details from Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            // Default placeholder profile
            setProfile({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Developer',
              email: firebaseUser.email ?? '',
              createdAt: new Date().toISOString(),
              role: 'user',
              title: 'Aspiring Engineer',
              skills: [],
              analytics: { resumeScore: 75, skillScore: 68, readinessScore: 78 },
            });
          }
        } catch (e) {
          console.warn('Could not load Firestore profile:', e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Redirect manager based on auth state
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      // Direct unauthorized user to login
      router.replace('/(auth)/login');
    } else if (user && (inAuthGroup || segments[0] === 'onboarding' || !segments[0])) {
      // Direct authenticated user to home dashboard
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.bg.base },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.base,
  },
});
