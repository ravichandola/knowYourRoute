import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { scrubUrlCredentials } from '../logging/redaction';

const STARTUP_RETRIES = 3;
const WARN_INTERVAL_MS = 10_000;

/** Atomic INCR + PEXPIRE so two API instances cannot lose a hit between the two commands. */
const INCR_WITH_TTL = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local pttl = redis.call('PTTL', KEYS[1])
return { n, pttl }
`;

/**
 * Redis-backed cache. Redis only holds transient data; losing it must never lose business data.
 *
 * - REDIS_URL set: Redis is used. Production fails fast at startup if it is unreachable. After
 *   startup, Redis outages degrade gracefully (reads miss, writes are dropped) and readiness reports
 *   the outage while ioredis keeps reconnecting.
 * - REDIS_URL unset (development/test only, production validation requires it): an in-memory map is used.
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private memoryOnly = false;
  private starting = true;
  private lastWarnAt = 0;
  private readonly memoryStore = new Map<string, { value: string; expiresAt?: number }>();
  private readonly memoryCounters = new Map<string, { hits: number; expiresAt: number }>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (!redisUrl) {
      if (isProduction) {
        throw new Error('REDIS_URL is required in production');
      }
      this.logger.warn('REDIS_URL not set: using in-memory cache (development/test only)');
      this.memoryOnly = true;
      return;
    }

    const client = new Redis(redisUrl, {
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 3000,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (this.starting && times > STARTUP_RETRIES) return null;
        return Math.min(times * 200, 3000);
      },
    });
    client.on('error', (err) => this.warnThrottled(`Redis error: ${scrubUrlCredentials(err.message)}`));
    client.on('ready', () => this.logger.log('Redis connection ready'));
    client.on('close', () => {
      if (!this.starting) this.warnThrottled('Redis connection closed; reconnecting');
    });

    try {
      await client.connect();
      this.client = client;
      this.starting = false;
    } catch (error) {
      client.disconnect();
      const reason = scrubUrlCredentials((error as Error).message);
      if (isProduction) {
        throw new Error(`Redis is unreachable at startup: ${reason}`);
      }
      this.logger.warn(`Redis is unreachable (${reason}); using in-memory cache for this process`);
      this.memoryOnly = true;
      this.starting = false;
    }
  }

  /** True when Redis responds. False when it is down, or when no Redis is in use at all. */
  async ping(): Promise<boolean> {
    if (!this.client) return false;
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  /** `memory` means no Redis is in use by design (dev/test); `redis` means Redis is configured. */
  get mode(): 'redis' | 'memory' {
    return this.client ? 'redis' : 'memory';
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) {
      const entry = this.memoryStore.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.memoryStore.delete(key);
        return null;
      }
      return JSON.parse(entry.value) as T;
    }

    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      this.warnThrottled(`Cache read failed: ${(error as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (!this.client) {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
      this.memoryStore.set(key, { value: serialized, expiresAt });
      return;
    }

    try {
      if (ttlSeconds) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      this.warnThrottled(`Cache write failed: ${(error as Error).message}`);
    }
  }

  /**
   * Atomically increments `key` and (on first hit) sets a millisecond TTL.
   * Used by rate limiting so every API instance shares one counter.
   * Redis outages after startup fall back to this process's in-memory counter.
   */
  async increment(key: string, ttlMs: number): Promise<{ hits: number; timeToExpireMs: number }> {
    if (this.client) {
      try {
        const result = (await this.client.eval(INCR_WITH_TTL, 1, key, String(ttlMs))) as [number, number];
        const hits = Number(result[0]);
        let pttl = Number(result[1]);
        if (pttl < 0) {
          await this.client.pexpire(key, ttlMs);
          pttl = ttlMs;
        }
        return { hits, timeToExpireMs: pttl };
      } catch (error) {
        this.warnThrottled(`Rate-limit increment failed: ${(error as Error).message}`);
      }
    }
    return this.incrementInMemory(key, ttlMs);
  }

  async del(key: string): Promise<void> {
    if (!this.client) {
      this.memoryStore.delete(key);
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      this.warnThrottled(`Cache delete failed: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      // Logged first: the async log transport can be cut off by process exit right after shutdown hooks.
      this.logger.log('Closing Redis connection');
      await this.client.quit().catch(() => this.client?.disconnect());
    }
  }

  private incrementInMemory(key: string, ttlMs: number): { hits: number; timeToExpireMs: number } {
    const now = Date.now();
    let entry = this.memoryCounters.get(key);
    if (!entry || entry.expiresAt <= now) {
      entry = { hits: 0, expiresAt: now + ttlMs };
      this.memoryCounters.set(key, entry);
    }
    entry.hits += 1;
    return { hits: entry.hits, timeToExpireMs: Math.max(0, entry.expiresAt - now) };
  }

  private warnThrottled(message: string): void {
    const now = Date.now();
    if (now - this.lastWarnAt >= WARN_INTERVAL_MS) {
      this.lastWarnAt = now;
      this.logger.warn(message);
    }
  }
}
