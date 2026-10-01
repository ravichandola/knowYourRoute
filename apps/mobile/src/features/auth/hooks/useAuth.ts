import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { useAuthStore } from '../store/auth.store';
import { LoginInput, SignupInput } from '@know-your-route/contracts';
import { useRouter } from 'expo-router';
import { routes } from '@/shared/navigation';
import { routeAfterAuth } from '../utils/route-after-auth';

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (input: LoginInput) => api.auth.login({ body: input }),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      routeAfterAuth(router, data.user.isOnboarded);
    },
  });
};

export const useSignup = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (input: SignupInput) => api.auth.signup({ body: input }),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.replace(routes.onboarding.welcome);
    },
  });
};
