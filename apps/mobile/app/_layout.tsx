import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/shared/theme';

// Create a stable TanStack QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={theme.colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
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
