export interface WelcomeLayoutProps {
  onSkip: () => void;
  onMobileLogin: () => void;
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
  googleLoading?: boolean;
  appleLoading?: boolean;
  showAppleSignIn?: boolean;
}
