export const PLAN_CACHE_PORT = 'PLAN_CACHE_PORT';
export interface PlanCachePort {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
}
