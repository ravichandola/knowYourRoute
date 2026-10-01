import React from 'react';
import { Stack } from 'expo-router';
import { groupStackScreenOptions } from '@/shared/layout';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={groupStackScreenOptions}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="vehicle" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
