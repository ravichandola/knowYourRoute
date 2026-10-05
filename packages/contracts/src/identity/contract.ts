import { createEndpointFactory } from '../http';
import {
  appleOAuthSchema,
  googleOAuthCodeSchema,
  googleOAuthSchema,
  loginSchema,
  signupSchema,
  tripPreferenceSchema,
} from './schemas';
import type { AuthResponse, TripPreference, User } from './types';

const AUTH_BASE_PATH = 'auth';
const auth = createEndpointFactory(AUTH_BASE_PATH);
const USERS_BASE_PATH = 'users';
const users = createEndpointFactory(USERS_BASE_PATH);

export const authContract = {
  basePath: AUTH_BASE_PATH,
  login: auth.post<AuthResponse>()('/login', { body: loginSchema }),
  signup: auth.post<AuthResponse>()('/signup', { body: signupSchema }),
  demoLogin: auth.post<AuthResponse>()('/demo-login'),
  oauthGoogle: auth.post<AuthResponse>()('/oauth/google', { body: googleOAuthSchema }),
  oauthGoogleCode: auth.post<AuthResponse>()('/oauth/google/code', { body: googleOAuthCodeSchema }),
  oauthApple: auth.post<AuthResponse>()('/oauth/apple', { body: appleOAuthSchema }),
} as const;

export const usersContract = {
  basePath: USERS_BASE_PATH,
  me: users.get<User>()('/me'),
  markOnboarded: users.patch<User>()('/me/onboarded'),
  getPreferences: users.get<TripPreference>()('/me/preferences'),
  updatePreferences: users.patch<TripPreference>()('/me/preferences', {
    body: tripPreferenceSchema,
  }),
} as const;
