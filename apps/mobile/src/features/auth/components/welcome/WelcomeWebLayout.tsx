import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../Logo';
import { FeatureHighlights } from '../FeatureHighlights';
import { LoginSheet } from '../LoginSheet';
import { welcomeTheme } from '../../theme/welcome.theme';
import { useResponsive } from '@/shared/hooks';
import { webInteractive, webMinHeight } from '@/shared/layout/platformStyles';
import type { WelcomeLayoutProps } from './welcome.types';

const HERO_IMAGE = require('../../../../../assets/welcome-hero.jpg');

export const WelcomeWebLayout: React.FC<WelcomeLayoutProps> = ({
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
  const { isDesktop, width } = useResponsive();

  return (
    <View style={[styles.root, webMinHeight]}>
      <View style={styles.splitRow}>
        {/* Left — brand hero */}
        <View style={[styles.heroPanel, isDesktop && styles.heroPanelDesktop]}>
          <ImageBackground source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover">
            <View style={styles.gradientOverlay}>
              <View style={[styles.gradientBand, styles.gradientTop]} />
              <View style={[styles.gradientBand, styles.gradientMid]} />
              <View style={[styles.gradientBand, styles.gradientBottom]} />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onSkip}
              style={[styles.skipButton, webInteractive, { top: insets.top + 16 }]}
              accessibilityRole="button"
              accessibilityLabel="Skip welcome screen"
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <View style={styles.heroContent}>
              <Logo size={isDesktop ? 104 : 92} />
              <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Know Your Route</Text>
              <Text style={[styles.tagline, isDesktop && styles.taglineDesktop]}>
                Smarter Journeys. Safer Roads. Happier Trips.
              </Text>
              <FeatureHighlights size="wide" maxWidth={Math.min(width * 0.42, 520)} />
            </View>
          </ImageBackground>
        </View>

        {/* Right — auth panel */}
        <ScrollView
          style={styles.authPanel}
          contentContainerStyle={[
            styles.authPanelContent,
            { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authInner}>
            <LoginSheet
              variant="panel"
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
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: welcomeTheme.colors.background,
  },
  splitRow: {
    flex: 1,
    flexDirection: 'row',
  },
  heroPanel: {
    flex: 1.05,
    minHeight: 640,
  },
  heroPanelDesktop: {
    flex: 1.15,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'center',
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
    right: 28,
    zIndex: 2,
    backgroundColor: welcomeTheme.colors.skipPill,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: welcomeTheme.radius.skip,
    minHeight: 38,
    justifyContent: 'center',
  },
  skipText: {
    color: welcomeTheme.colors.textOnHero,
    fontSize: 14,
    fontWeight: '600',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 48,
    zIndex: 1,
  },
  title: {
    marginTop: 22,
    fontSize: 34,
    fontWeight: '800',
    color: welcomeTheme.colors.textOnHero,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  titleDesktop: {
    fontSize: 40,
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 420,
  },
  taglineDesktop: {
    fontSize: 17,
    maxWidth: 480,
  },
  authPanel: {
    flex: 0.95,
    backgroundColor: welcomeTheme.colors.background,
    borderLeftWidth: 1,
    borderLeftColor: welcomeTheme.colors.border,
  },
  authPanelContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  authInner: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
});
