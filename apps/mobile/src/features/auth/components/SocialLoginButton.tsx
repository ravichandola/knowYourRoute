import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  ViewStyle,
  Platform,
} from 'react-native';
import { welcomeTheme } from '../theme/welcome.theme';
import { webInteractive, webNoSelect } from '@/shared/layout/platformStyles';

type SocialProvider = 'google' | 'apple';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

const LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
};

function ProviderIcon({ provider }: { provider: SocialProvider }) {
  if (provider === 'google') {
    return (
      <View style={styles.googleIcon}>
        <Text style={styles.googleGlyph}>G</Text>
      </View>
    );
  }

  return <Text style={styles.appleGlyph}>{Platform.OS === 'ios' ? '' : 'A'}</Text>;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
  loading = false,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
      style={[styles.button, webInteractive, style]}
      accessibilityRole="button"
      accessibilityLabel={LABELS[provider]}
    >
      {loading ? (
        <ActivityIndicator color={welcomeTheme.colors.textPrimary} />
      ) : (
        <View style={styles.content}>
          <ProviderIcon provider={provider} />
          <Text style={[styles.label, webNoSelect]}>{LABELS[provider]}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: welcomeTheme.sizes.socialButtonHeight,
    borderRadius: welcomeTheme.radius.button,
    borderWidth: 1,
    borderColor: welcomeTheme.colors.border,
    backgroundColor: welcomeTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: welcomeTheme.colors.border,
  },
  googleGlyph: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4285F4',
    lineHeight: 16,
  },
  appleGlyph: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: welcomeTheme.colors.textPrimary,
  },
});
