type JwtPayload = Record<string, unknown>;

export class JwtService {
  private static readonly tokens = new Map<string, JwtPayload>();

  sign(payload: JwtPayload): string {
    const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    JwtService.tokens.set(token, payload);
    return token;
  }

  async verifyAsync<T extends JwtPayload>(token: string): Promise<T> {
    const payload = JwtService.tokens.get(token);
    if (!payload) {
      throw new Error('Invalid token');
    }
    return payload as T;
  }
}

export class JwtModule {
  static registerAsync() {
    return {
      module: JwtModule,
      providers: [JwtService],
      exports: [JwtService],
    };
  }
}
