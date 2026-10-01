import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="vehicle" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
