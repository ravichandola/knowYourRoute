import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../../api/auth';
import { useAuthStore } from '../../../stores/auth.store';
import { LoginInput, SignupInput } from '@know-your-route/validation';
import { useRouter } from 'expo-router';

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      if (data.user.isOnboarded) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    },
  });
};

export const useSignup = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (input: SignupInput) => authApi.signup(input),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.replace('/(onboarding)/welcome');
    },
  });
};
