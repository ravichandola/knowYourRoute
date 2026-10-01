export interface StorageProvider {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  headBucket(): Promise<boolean>;
}

export interface StoragePolicy {
  maxUploadBytes: number;
  signedUrlTtlSeconds: number;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
export const STORAGE_POLICY = Symbol('STORAGE_POLICY');
