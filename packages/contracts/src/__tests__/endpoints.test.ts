/// <reference types="jest" />
import {
  buildPath,
  fastagContract,
  isEndpoint,
  routePlanRequestSchema,
  routesContract,
  tripsContract,
  vehiclesContract,
} from '../index';

describe('Endpoint contracts', () => {
  it('exposes the full path next to the controller-relative path', () => {
    expect(vehiclesContract.uploadSnapshot.basePath).toBe('vehicles');
    expect(vehiclesContract.uploadSnapshot.path).toBe('/:id/snapshot');
    expect(vehiclesContract.uploadSnapshot.fullPath).toBe('/vehicles/:id/snapshot');
    expect(vehiclesContract.list.fullPath).toBe('/vehicles');
  });

  it('keeps method and body schema together with the route', () => {
    expect(routesContract.plan.method).toBe('POST');
    expect(routesContract.plan.bodySchema).toBe(routePlanRequestSchema);
    expect(tripsContract.explain.method).toBe('GET');
  });

  it('builds paths with encoded params and query strings', () => {
    expect(buildPath('/vehicles/:id/snapshot', { id: 'veh 1' })).toBe('/vehicles/veh%201/snapshot');
    expect(buildPath('/fastag/:tagNumber/verify', { tagNumber: 'FT-1' }, { tollCost: 320 })).toBe(
      '/fastag/FT-1/verify?tollCost=320'
    );
  });

  it('throws when a path param is missing', () => {
    expect(() => buildPath('/trips/:id')).toThrow('Missing path param "id"');
  });

  it('coerces query string values using the endpoint query schema', () => {
    const parsed = fastagContract.tagVerify.querySchema?.parse({ tollCost: '320' });
    expect(parsed).toEqual({ tollCost: 320 });
  });

  it('recognises endpoint objects only', () => {
    expect(isEndpoint(vehiclesContract.list)).toBe(true);
    expect(isEndpoint({ fullPath: 1 })).toBe(false);
    expect(isEndpoint(null)).toBe(false);
  });

  it('accepts non-uuid vehicle ids such as the demo vehicle', () => {
    const result = routePlanRequestSchema.safeParse({
      origin: { name: 'A', location: { latitude: 19, longitude: 72 } },
      destination: { name: 'B', location: { latitude: 18, longitude: 73 } },
      vehicleId: 'veh_demo_creta',
    });
    expect(result.success).toBe(true);
  });
});
