import { ForbiddenException } from '@nestjs/common';
import {
  DEMO_FASTAG_TAG_NUMBER,
  DEMO_USER_ID,
  DEMO_VEHICLE_ID,
} from '../../../platform/demo/demo-data';
import { InMemoryFastagConnectionRepository } from '../infrastructure/in-memory-fastag-connection.repository';
import { MockFastagAdapter } from '../infrastructure/mock-fastag.adapter';
import { FastagFacade } from './fastag.facade';
import { FastagService } from './fastag.service';

describe('FastagService', () => {
  let service: FastagService;

  beforeEach(() => {
    service = new FastagService(new InMemoryFastagConnectionRepository(), new MockFastagAdapter());
  });

  it('resolves the demo user FASTag instead of a hardcoded planner tag', async () => {
    await expect(service.resolveTagNumber(DEMO_USER_ID, DEMO_VEHICLE_ID)).resolves.toBe(
      DEMO_FASTAG_TAG_NUMBER
    );
    await expect(service.resolveTagNumber('usr_someone_else')).resolves.toBeUndefined();
  });

  it('computes toll shortfall against the linked tag balance', async () => {
    const result = await service.verifyTollSufficiency(DEMO_FASTAG_TAG_NUMBER, 900);
    expect(result.isBalanceSufficientForTrip).toBe(false);
    expect(result.shortfallAmount).toBe(150);
    expect(result.lowBalanceWarning).toBe(true);
  });

  it('refuses access to tags that belong to someone else', async () => {
    await expect(
      service.assertTagOwnedByUser('usr_someone_else', DEMO_FASTAG_TAG_NUMBER)
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('exposes a facade that reports undefined when no tag is linked', async () => {
    const facade = new FastagFacade(service);
    await expect(facade.checkTollSufficiency({ userId: 'usr_none', tollCost: 100 })).resolves.toBeUndefined();
    await expect(
      facade.checkTollSufficiency({ userId: DEMO_USER_ID, vehicleId: DEMO_VEHICLE_ID, tollCost: 100 })
    ).resolves.toEqual(expect.objectContaining({ isBalanceSufficientForTrip: true }));
  });
});
