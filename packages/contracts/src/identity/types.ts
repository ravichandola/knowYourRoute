export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
  otp?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface SessionUser extends User {
  token: string;
}

export interface TripPreference {
  id?: string;
  userId?: string;
  preferredStopsIntervalKm?: number;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  maxDrivingHoursPerDay?: number;
  drivingStyle?: 'ECONOMICAL' | 'BALANCED' | 'SPIRITED';
}
