import { evaluateSafety } from './safety';

describe('evaluateSafety', () => {
  it('rates highway-dominant corridors as HIGH', () => {
    const result = evaluateSafety(150, 90);
    expect(result.rating).toBe('HIGH');
    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(result.nightDrivingRisk).toBe('LOW');
    expect(result.knownIncidents).toHaveLength(0);
  });

  it('rates mixed roads as MODERATE with caution incidents', () => {
    const result = evaluateSafety(80, 40);
    expect(result.rating).toBe('MODERATE');
    expect(result.nightDrivingRisk).toBe('MEDIUM');
    expect(result.knownIncidents.length).toBeGreaterThan(0);
  });
});
