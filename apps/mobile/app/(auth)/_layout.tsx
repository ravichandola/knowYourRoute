import React from 'react';
import { Stack } from 'expo-router';
import { groupStackScreenOptions } from '@/shared/layout';

export default function AuthLayout() {
  return (
    <Stack screenOptions={groupStackScreenOptions}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="mobile-login" />
    </Stack>
  );
}
