import { SafetyService } from './safety.service';

describe('SafetyService', () => {
  const service = new SafetyService();

  it('rates highway-dominant corridors as HIGH', () => {
    const result = service.evaluateSafety(150, 90);
    expect(result.rating).toBe('HIGH');
    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(result.nightDrivingRisk).toBe('LOW');
    expect(result.knownIncidents).toHaveLength(0);
  });

  it('rates mixed roads as MODERATE with caution incidents', () => {
    const result = service.evaluateSafety(80, 40);
    expect(result.rating).toBe('MODERATE');
    expect(result.nightDrivingRisk).toBe('MEDIUM');
    expect(result.knownIncidents.length).toBeGreaterThan(0);
  });
});
