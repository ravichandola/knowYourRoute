import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Phone } from 'lucide-react-native';
import { welcomeTheme } from '../theme/welcome.theme';
import { SocialLoginButton } from './SocialLoginButton';
import { webInteractive, webNoSelect } from '@/shared/layout/platformStyles';

type LoginSheetVariant = 'sheet' | 'panel';

interface LoginSheetProps {
  variant?: LoginSheetVariant;
  onMobileLogin: () => void;
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
  mobileLoading?: boolean;
  googleLoading?: boolean;
  appleLoading?: boolean;
  showAppleSignIn?: boolean;
}

export const LoginSheet: React.FC<LoginSheetProps> = ({
  variant = 'sheet',
  onMobileLogin,
  onGoogleLogin,
  onAppleLogin,
  onTerms,
  onPrivacy,
  mobileLoading = false,
  googleLoading = false,
  appleLoading = false,
  showAppleSignIn = true,
}) => {
  const isPanel = variant === 'panel';

  return (
    <View style={[styles.sheet, isPanel ? styles.panel : styles.bottomSheet]}>
      {!isPanel && <View style={styles.dragIndicator} />}

      <Text style={[styles.heading, isPanel && styles.headingPanel]}>
        Welcome to Know Your Route
      </Text>
      <Text style={[styles.description, isPanel && styles.descriptionPanel]}>
        Plan smarter, drive safer and discover better stops for every journey.
      </Text>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onMobileLogin}
        disabled={mobileLoading}
        style={[styles.primaryButton, webInteractive]}
      >
        {mobileLoading ? (
          <ActivityIndicator color={welcomeTheme.colors.textOnHero} />
        ) : (
          <>
            <Phone size={20} color={welcomeTheme.colors.textOnHero} strokeWidth={2.2} />
            <Text style={[styles.primaryButtonText, webNoSelect]}>
              Continue with Mobile Number
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <SocialLoginButton provider="google" onPress={onGoogleLogin} loading={googleLoading} />
      {showAppleSignIn ? (
        <SocialLoginButton
          provider="apple"
          onPress={onAppleLogin}
          loading={appleLoading}
          style={styles.socialSpacing}
        />
      ) : null}

      <Text style={styles.legalIntro}>By continuing, you agree to our</Text>
      <View style={styles.legalLinks}>
        <Pressable onPress={onTerms} hitSlop={8} style={webInteractive as ViewStyle}>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </Pressable>
        <Text style={styles.legalAmp}>&</Text>
        <Pressable onPress={onPrivacy} hitSlop={8} style={webInteractive as ViewStyle}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: welcomeTheme.colors.background,
    paddingHorizontal: welcomeTheme.spacing.sheetHorizontal,
    paddingBottom: 28,
  },
  bottomSheet: {
    borderTopLeftRadius: welcomeTheme.radius.sheet,
    borderTopRightRadius: welcomeTheme.radius.sheet,
    paddingTop: welcomeTheme.spacing.sheetTop,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  panel: {
    borderRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  dragIndicator: {
    width: welcomeTheme.sizes.dragIndicatorWidth,
    height: welcomeTheme.sizes.dragIndicatorHeight,
    borderRadius: 2,
    backgroundColor: welcomeTheme.colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: welcomeTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  headingPanel: {
    fontSize: 28,
    textAlign: 'left',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: welcomeTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  descriptionPanel: {
    textAlign: 'left',
    fontSize: 15,
    paddingHorizontal: 0,
  },
  primaryButton: {
    height: welcomeTheme.sizes.primaryButtonHeight,
    borderRadius: welcomeTheme.radius.button,
    backgroundColor: welcomeTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: welcomeTheme.colors.textOnHero,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: welcomeTheme.colors.border,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
    color: welcomeTheme.colors.textSecondary,
    fontWeight: '500',
  },
  socialSpacing: {
    marginTop: 12,
  },
  legalIntro: {
    marginTop: 22,
    fontSize: 12,
    color: welcomeTheme.colors.textSecondary,
    textAlign: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '600',
    color: welcomeTheme.colors.link,
  },
  legalAmp: {
    fontSize: 12,
    color: welcomeTheme.colors.textSecondary,
    marginHorizontal: 6,
  },
});
