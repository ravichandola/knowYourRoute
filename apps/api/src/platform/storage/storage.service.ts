import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { AuthorizationError, ValidationError } from '../errors';
import { STORAGE_POLICY, STORAGE_PROVIDER, StoragePolicy, StorageProvider } from './storage.port';

const EXTENSIONS: Readonly<Record<string, string>> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'application/pdf': '.pdf',
};

const PURPOSE_PATTERN = /^[a-z][a-z0-9-]{1,31}$/;

export interface UploadOptions {
  userId: string;
  /** Short lowercase slug such as `vehicle-photo`. Never derived from client input without validation. */
  purpose: string;
  body: Buffer;
  contentType: string;
}

/**
 * Owns storage policy so no business module talks to the S3 SDK directly:
 * generated keys (the client filename is never used), content-type allow-list, size limit,
 * per-user ownership and short-lived signed URLs. Objects are always private.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider,
    @Inject(STORAGE_POLICY) private readonly policy: StoragePolicy,
  ) {}

  async upload(options: UploadOptions): Promise<string> {
    if (!PURPOSE_PATTERN.test(options.purpose)) {
      throw new ValidationError('Invalid storage purpose');
    }
    const extension = EXTENSIONS[options.contentType];
    if (!extension) {
      throw new ValidationError(`Content type "${options.contentType}" is not allowed`);
    }
    if (options.body.length === 0) {
      throw new ValidationError('File is empty');
    }
    if (options.body.length > this.policy.maxUploadBytes) {
      throw new ValidationError(`File exceeds the ${this.policy.maxUploadBytes} byte limit`);
    }

    const key = `users/${options.userId}/${options.purpose}/${uuid()}${extension}`;
    await this.provider.put(key, options.body, options.contentType);
    this.logger.log({ key, bytes: options.body.length }, 'Stored object');
    return key;
  }

  async getSignedUrl(key: string, userId: string): Promise<string> {
    this.assertOwnership(key, userId);
    return this.provider.getSignedUrl(key, this.policy.signedUrlTtlSeconds);
  }

  async download(key: string, userId: string): Promise<Buffer | null> {
    this.assertOwnership(key, userId);
    return this.provider.get(key);
  }

  async remove(key: string, userId: string): Promise<void> {
    this.assertOwnership(key, userId);
    await this.provider.delete(key);
    this.logger.log({ key }, 'Deleted object');
  }

  checkBucket(): Promise<boolean> {
    return this.provider.headBucket();
  }

  private assertOwnership(key: string, userId: string): void {
    if (key.includes('..') || !key.startsWith(`users/${userId}/`)) {
      throw new AuthorizationError('Access to this object is not allowed');
    }
  }
}
