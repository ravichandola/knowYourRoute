import { AuthorizationError, ValidationError } from '../errors';
import type { StorageProvider } from './storage.port';
import { StorageService } from './storage.service';

function createFakeProvider(): StorageProvider & { stored: Map<string, Buffer> } {
  const stored = new Map<string, Buffer>();
  return {
    stored,
    put: jest.fn(async (key: string, body: Buffer) => {
      stored.set(key, body);
    }),
    get: jest.fn(async (key: string) => stored.get(key) ?? null),
    delete: jest.fn(async (key: string) => {
      stored.delete(key);
    }),
    getSignedUrl: jest.fn(async (key: string, ttl: number) => `https://signed.test/${key}?ttl=${ttl}`),
    headBucket: jest.fn(async () => true),
  };
}

describe('StorageService', () => {
  let provider: ReturnType<typeof createFakeProvider>;
  let service: StorageService;

  beforeEach(() => {
    provider = createFakeProvider();
    service = new StorageService(provider, { maxUploadBytes: 1024, signedUrlTtlSeconds: 300 });
  });

  const upload = (overrides: Partial<Parameters<StorageService['upload']>[0]> = {}) =>
    service.upload({
      userId: 'user-1',
      purpose: 'vehicle-photo',
      body: Buffer.from('image-data'),
      contentType: 'image/png',
      ...overrides,
    });

  it('generates a safe private key and never uses a client filename', async () => {
    const key = await upload();
    expect(key).toMatch(/^users\/user-1\/vehicle-photo\/[0-9a-f-]{36}\.png$/);
    expect(provider.stored.get(key)?.toString()).toBe('image-data');
  });

  it('rejects files over the configured size limit', async () => {
    await expect(upload({ body: Buffer.alloc(1025) })).rejects.toBeInstanceOf(ValidationError);
    expect(provider.put).not.toHaveBeenCalled();
  });

  it('rejects empty files and disallowed content types', async () => {
    await expect(upload({ body: Buffer.alloc(0) })).rejects.toBeInstanceOf(ValidationError);
    await expect(upload({ contentType: 'text/html' })).rejects.toBeInstanceOf(ValidationError);
    await expect(upload({ contentType: 'application/octet-stream' })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('rejects unsafe purposes that could escape the user prefix', async () => {
    await expect(upload({ purpose: '../other' })).rejects.toBeInstanceOf(ValidationError);
    await expect(upload({ purpose: 'a/b' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('only signs, reads and deletes objects the user owns', async () => {
    const key = await upload();
    await expect(service.getSignedUrl(key, 'user-2')).rejects.toBeInstanceOf(AuthorizationError);
    await expect(service.download(key, 'user-2')).rejects.toBeInstanceOf(AuthorizationError);
    await expect(service.remove(key, 'user-2')).rejects.toBeInstanceOf(AuthorizationError);
    await expect(
      service.getSignedUrl('users/user-1/../user-2/x.png', 'user-1'),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('issues short-lived signed URLs for owned objects', async () => {
    const key = await upload();
    await expect(service.getSignedUrl(key, 'user-1')).resolves.toContain('ttl=300');
  });

  it('downloads and deletes owned objects', async () => {
    const key = await upload();
    expect((await service.download(key, 'user-1'))?.toString()).toBe('image-data');
    await service.remove(key, 'user-1');
    expect(await service.download(key, 'user-1')).toBeNull();
  });
});
