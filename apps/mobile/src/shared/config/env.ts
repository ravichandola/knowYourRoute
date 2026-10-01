declare const process: { env: Record<string, string | undefined> };

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const appEnv = (process.env.EXPO_PUBLIC_APP_ENV as 'development' | 'staging' | 'production') || 'development';

if (!apiUrl && appEnv !== 'development') {
  throw new Error('EXPO_PUBLIC_API_URL is required outside development');
}

export const ENV = {
  API_BASE_URL: apiUrl || 'http://localhost:4000/api/v1',
  ENVIRONMENT: appEnv,
  ENABLE_MOCKS: process.env.EXPO_PUBLIC_ENABLE_MOCKS !== 'false',
  IS_DEV: appEnv === 'development',
};
