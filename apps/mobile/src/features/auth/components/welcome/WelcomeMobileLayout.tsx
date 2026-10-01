import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../Logo';
import { FeatureHighlights } from '../FeatureHighlights';
import { LoginSheet } from '../LoginSheet';
import { welcomeTheme } from '../../theme/welcome.theme';
import { webInteractive } from '@/shared/layout/platformStyles';
import type { WelcomeLayoutProps } from './welcome.types';

const HERO_IMAGE = require('../../../../../assets/welcome-hero.jpg');

export const WelcomeMobileLayout: React.FC<WelcomeLayoutProps> = ({
  onSkip,
  onMobileLogin,
  onGoogleLogin,
  onAppleLogin,
  onTerms,
  onPrivacy,
  googleLoading,
  appleLoading,
  showAppleSignIn = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={styles.heroContainer}>
        <ImageBackground source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover">
          <View style={styles.gradientOverlay}>
            <View style={[styles.gradientBand, styles.gradientTop]} />
            <View style={[styles.gradientBand, styles.gradientMid]} />
            <View style={[styles.gradientBand, styles.gradientBottom]} />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onSkip}
            style={[styles.skipButton, webInteractive, { top: insets.top + 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Skip welcome screen"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <View style={[styles.heroContent, { paddingTop: insets.top + 56 }]}>
            <Logo size={88} />
            <Text style={styles.title}>Know Your Route</Text>
            <Text style={styles.tagline}>Smarter Journeys. Safer Roads. Happier Trips.</Text>
            <FeatureHighlights size="compact" />
          </View>
        </ImageBackground>
      </View>

      <View style={[styles.sheetWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <LoginSheet
          variant="sheet"
          onMobileLogin={onMobileLogin}
          onGoogleLogin={onGoogleLogin}
          onAppleLogin={onAppleLogin}
          onTerms={onTerms}
          onPrivacy={onPrivacy}
          googleLoading={googleLoading}
          appleLoading={appleLoading}
          showAppleSignIn={showAppleSignIn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: welcomeTheme.colors.background,
  },
  heroContainer: {
    flex: 1.08,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientBand: {
    flex: 1,
  },
  gradientTop: {
    backgroundColor: welcomeTheme.colors.heroOverlayTop,
  },
  gradientMid: {
    backgroundColor: welcomeTheme.colors.heroOverlayMid,
  },
  gradientBottom: {
    backgroundColor: welcomeTheme.colors.heroOverlayBottom,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
    backgroundColor: welcomeTheme.colors.skipPill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: welcomeTheme.radius.skip,
    minHeight: 36,
    justifyContent: 'center',
  },
  skipText: {
    color: welcomeTheme.colors.textOnHero,
    fontSize: 14,
    fontWeight: '600',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 52,
    zIndex: 1,
  },
  title: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: '800',
    color: welcomeTheme.colors.textOnHero,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  sheetWrapper: {
    marginTop: -30,
    zIndex: 3,
  },
});
