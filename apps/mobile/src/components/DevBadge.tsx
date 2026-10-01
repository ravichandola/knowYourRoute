import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ENV } from '../config/env';
import { theme } from '../theme';

export const DevBadge: React.FC = () => {
  if (!ENV.IS_DEV) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>DEV MOCK MODE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.warning,
    marginRight: 6,
  },
  text: {
    color: theme.colors.warning,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
