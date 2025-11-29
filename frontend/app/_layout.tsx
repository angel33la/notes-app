import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import authService from '@/services/auth.service';
import api from '@/services/api';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) return;
        // validate token against running backend
        await api.get('/debug/whoami');
      } catch {
        // If validation fails, clear stored token and redirect to login
        try { await authService.logout(); } catch {}
        if (mounted) {
          try { router.replace('/(tabs)/User'); } catch { if (typeof window !== 'undefined') window.location.reload(); }
        }
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
