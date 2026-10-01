declare const process: { env: Record<string, string | undefined> };

export const ENV = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  ENVIRONMENT:
    (process.env.EXPO_PUBLIC_APP_ENV as 'development' | 'staging' | 'production') ||
    'development',
  ENABLE_MOCKS: process.env.EXPO_PUBLIC_ENABLE_MOCKS !== 'false',
  IS_DEV: (process.env.EXPO_PUBLIC_APP_ENV || 'development') === 'development',
};
