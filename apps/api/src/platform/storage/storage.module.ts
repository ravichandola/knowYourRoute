import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import { S3StorageProvider } from './s3-storage.provider';
import { STORAGE_POLICY, STORAGE_PROVIDER, StoragePolicy, StorageProvider } from './storage.port';
import { StorageService } from './storage.service';

class DisabledStorageProvider implements StorageProvider {
  private fail(): never {
    throw new Error('Object storage is disabled (STORAGE_ENABLED=false)');
  }
  async put(): Promise<void> {
    this.fail();
  }
  async get(): Promise<Buffer | null> {
    return this.fail();
  }
  async delete(): Promise<void> {
    this.fail();
  }
  async getSignedUrl(): Promise<string> {
    return this.fail();
  }
  async headBucket(): Promise<boolean> {
    return false;
  }
}

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>): StorageProvider => {
        if (!config.get('STORAGE_ENABLED', { infer: true })) {
          return new DisabledStorageProvider();
        }
        const endpoint = config.get('STORAGE_ENDPOINT', { infer: true });
        const accessKeyId = config.get('STORAGE_ACCESS_KEY', { infer: true });
        const secretAccessKey = config.get('STORAGE_SECRET_KEY', { infer: true });
        if (!endpoint || !accessKeyId || !secretAccessKey) {
          throw new Error(
            'STORAGE_ENABLED=true requires STORAGE_ENDPOINT, STORAGE_ACCESS_KEY and STORAGE_SECRET_KEY',
          );
        }
        return new S3StorageProvider({
          endpoint,
          accessKeyId,
          secretAccessKey,
          bucket: config.get('STORAGE_BUCKET', { infer: true }),
          region: config.get('STORAGE_REGION', { infer: true }),
          forcePathStyle: config.get('STORAGE_FORCE_PATH_STYLE', { infer: true }),
        });
      },
    },
    {
      provide: STORAGE_POLICY,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>): StoragePolicy => ({
        maxUploadBytes: config.get('STORAGE_MAX_UPLOAD_BYTES', { infer: true }),
        signedUrlTtlSeconds: config.get('STORAGE_SIGNED_URL_TTL_SECONDS', { infer: true }),
      }),
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule implements OnModuleInit {
  private readonly logger = new Logger(StorageModule.name);

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly storage: StorageService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.config.get('STORAGE_ENABLED', { infer: true })) {
      this.logger.log('Object storage disabled (STORAGE_ENABLED=false)');
      return;
    }

    const reachable = await this.storage.checkBucket();
    if (reachable) {
      this.logger.log('Object storage bucket reachable');
    } else if (this.config.get('NODE_ENV', { infer: true }) === 'production') {
      throw new Error('Object storage bucket is not reachable');
    } else {
      this.logger.warn('Object storage bucket is not reachable; uploads will fail until it is');
    }
  }
}
