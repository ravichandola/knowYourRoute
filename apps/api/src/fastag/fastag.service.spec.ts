import { FastagService } from './fastag.service';
import { MockFastagAdapter } from '../providers/fastag/mock-fastag.adapter';
import { DEMO_USER_ID } from '../auth/auth.constants';

describe('FastagService', () => {
  let service: FastagService;

  beforeEach(() => {
    const prisma = {
      fastagConnection: {
        findFirst: jest.fn().mockRejectedValue(new Error('db offline')),
        findMany: jest.fn().mockRejectedValue(new Error('db offline')),
      },
    } as any;
    service = new FastagService(new MockFastagAdapter(), prisma);
  });

  it('resolves the demo user FASTag instead of a hardcoded planner tag', async () => {
    await expect(service.resolveTagNumber(DEMO_USER_ID, 'veh_demo_creta')).resolves.toBe(
      'FT-88392019-ICICI'
    );
    await expect(service.resolveTagNumber('usr_someone_else')).resolves.toBeUndefined();
  });

  it('computes toll shortfall against the linked tag balance', async () => {
    const result = await service.verifyTollSufficiency('FT-88392019-ICICI', 900);
    expect(result.isBalanceSufficientForTrip).toBe(false);
    expect(result.shortfallAmount).toBe(150);
    expect(result.lowBalanceWarning).toBe(true);
  });
});
