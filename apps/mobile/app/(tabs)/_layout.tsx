import React from 'react';
import { Tabs } from 'expo-router';
import { theme } from '@/shared/theme';
import { Home, Compass, Car, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.surfaceBorder,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          ...theme.shadows.sm,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'My Trips',
          tabBarIcon: ({ color, size }) => <Compass size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicle"
        options={{
          title: 'Vehicle',
          tabBarIcon: ({ color, size }) => <Car size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
