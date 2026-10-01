import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private memoryStore = new Map<string, { value: string; expiresAt?: number }>();
  private useMemoryFallback = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));

    try {
      this.client = new Redis({
        host,
        port,
        retryStrategy: (times) => {
          if (times > 2) {
            this.logger.warn('Redis unreachable. Falling back to internal In-Memory cache.');
            this.useMemoryFallback = true;
            return null; // Stop retrying
          }
          return Math.min(times * 100, 1000);
        },
        lazyConnect: true,
      });

      this.client.on('error', (err) => {
        if (!this.useMemoryFallback) {
          this.logger.warn(`Redis error: ${err.message}. Using In-Memory cache.`);
          this.useMemoryFallback = true;
        }
      });

      await this.client.connect().catch(() => {
        this.useMemoryFallback = true;
        this.logger.warn('Unable to connect to Redis. In-memory cache enabled for local development.');
      });
    } catch {
      this.useMemoryFallback = true;
      this.logger.warn('Redis connection failed. Running in-memory cache mode.');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useMemoryFallback || !this.client) {
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
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.useMemoryFallback || !this.client) {
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
    } catch {
      // Fallback silently to memory
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
      this.memoryStore.set(key, { value: serialized, expiresAt });
    }
  }

  async del(key: string): Promise<void> {
    if (this.useMemoryFallback || !this.client) {
      this.memoryStore.delete(key);
      return;
    }

    try {
      await this.client.del(key);
    } catch {
      this.memoryStore.delete(key);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }
}
