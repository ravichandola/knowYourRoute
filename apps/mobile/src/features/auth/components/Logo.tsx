import React from 'react';
import { View, StyleSheet } from 'react-native';
import { welcomeTheme } from '../theme/welcome.theme';

interface LogoProps {
  size?: number;
}

/** Stylized Know Your Route app mark — road, mountains, sun. */
export const Logo: React.FC<LogoProps> = ({ size = 88 }) => {
  const cornerRadius = size * 0.22;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: cornerRadius }]}>
      <View style={styles.sky}>
        <View style={[styles.sun, { top: size * 0.14, left: size * 0.16, width: size * 0.18, height: size * 0.18 }]} />

        <View
          style={[
            styles.mountainBack,
            {
              borderBottomWidth: size * 0.34,
              borderLeftWidth: size * 0.28,
              borderRightWidth: size * 0.28,
              bottom: size * 0.22,
            },
          ]}
        />
        <View
          style={[
            styles.mountainFront,
            {
              borderBottomWidth: size * 0.28,
              borderLeftWidth: size * 0.22,
              borderRightWidth: size * 0.22,
              bottom: size * 0.22,
              marginLeft: size * 0.18,
            },
          ]}
        />

        <View
          style={[
            styles.road,
            {
              bottom: size * 0.1,
              height: size * 0.34,
              width: size * 0.2,
              marginLeft: size * 0.02,
            },
          ]}
        />
        <View
          style={[
            styles.roadLine,
            {
              bottom: size * 0.24,
              height: size * 0.1,
              width: size * 0.025,
              marginLeft: size * 0.02,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  sky: {
    flex: 1,
    backgroundColor: '#7EC8E3',
  },
  sun: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FBBF24',
  },
  mountainBack: {
    position: 'absolute',
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderBottomColor: '#2D8B57',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  mountainFront: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderBottomColor: '#1F7A4C',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  road: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    transform: [{ skewX: '-6deg' }],
  },
  roadLine: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#FDE68A',
    borderRadius: 2,
    opacity: 0.9,
  },
});
