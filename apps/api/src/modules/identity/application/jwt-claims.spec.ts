jest.mock('./oauth-token-verifier.service', () => ({
  OAuthTokenVerifierService: class {
    verifyGoogleIdToken = jest.fn();
    verifyAppleIdentityToken = jest.fn();
  },
}));

import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { OAuthTokenVerifierService } from './oauth-token-verifier.service';
import { AuthenticationError } from '../../../platform/errors';
import { InMemoryUserRepository } from '../infrastructure/in-memory-user.repository';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../../platform/demo/demo-data';
import type { ConfigService } from '@nestjs/config';

const SECRET = 'jwt-claims-spec-secret-0123456789abcdef';

const config = { get: (key: string) => (key === 'JWT_EXPIRES_IN' ? '7d' : undefined) } as unknown as ConfigService;

function serviceFor(issuer: string, audience: string) {
  const jwt = new JwtService({
    secret: SECRET,
    signOptions: { issuer, audience, expiresIn: 60 },
    verifyOptions: { issuer: 'know-your-route', audience: 'know-your-route' },
  });
  return {
    jwt,
    auth: new AuthService(new InMemoryUserRepository(), jwt, config, new OAuthTokenVerifierService(config)),
  };
}

describe('JWT validation', () => {
  it('accepts tokens with the expected issuer and audience', async () => {
    const { auth } = serviceFor('know-your-route', 'know-your-route');
    const { token } = await auth.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    await expect(auth.validateToken(token)).resolves.toMatchObject({ email: DEMO_EMAIL });
  });

  it('rejects tokens from another issuer or audience', async () => {
    const { auth: foreign } = serviceFor('someone-else', 'know-your-route');
    const { token: wrongIssuer } = await foreign.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    const { auth } = serviceFor('know-your-route', 'know-your-route');
    await expect(auth.validateToken(wrongIssuer)).rejects.toBeInstanceOf(AuthenticationError);

    const { auth: otherAudience } = serviceFor('know-your-route', 'another-api');
    const { token: wrongAudience } = await otherAudience.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    await expect(auth.validateToken(wrongAudience)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('rejects expired tokens and tokens without a subject', async () => {
    const { auth, jwt } = serviceFor('know-your-route', 'know-your-route');
    const expired = jwt.sign({ sub: 'usr', email: 'x@y.z' }, { expiresIn: -10 });
    await expect(auth.validateToken(expired)).rejects.toBeInstanceOf(AuthenticationError);

    const noSubject = jwt.sign({ email: 'x@y.z' });
    await expect(auth.validateToken(noSubject)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('rejects tokens signed with a different secret', async () => {
    const { auth } = serviceFor('know-your-route', 'know-your-route');
    const forged = new JwtService({ secret: 'different-secret-0123456789abcdef0123' }).sign(
      { sub: 'usr', email: 'x@y.z' },
      { issuer: 'know-your-route', audience: 'know-your-route' },
    );
    await expect(auth.validateToken(forged)).rejects.toBeInstanceOf(AuthenticationError);
  });
});
