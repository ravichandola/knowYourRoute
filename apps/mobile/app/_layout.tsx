import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/shared/theme';
import { useAuthStore } from '@/features/auth';
import { webMinHeight } from '@/shared/layout/platformStyles';

import '@/app-shell/configure-api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" backgroundColor={theme.colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
              ...(Platform.OS === 'web' ? webMinHeight : {}),
            },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="plan/index"
            options={{ presentation: 'card', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="plan/routes" options={{ presentation: 'card' }} />
          <Stack.Screen name="plan/route-detail" options={{ presentation: 'card' }} />
          <Stack.Screen name="trip/[tripId]" options={{ presentation: 'card' }} />
          <Stack.Screen name="trip/live" options={{ presentation: 'fullScreenModal' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
