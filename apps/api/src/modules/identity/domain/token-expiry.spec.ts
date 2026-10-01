import { toExpirySeconds } from './token-expiry';

describe('toExpirySeconds', () => {
  it.each([
    ['30s', 30],
    ['15m', 900],
    ['2h', 7200],
    ['7d', 604800],
  ])('converts %s', (input, expected) => {
    expect(toExpirySeconds(input)).toBe(expected);
  });

  it('defaults to seven days for invalid input', () => {
    expect(toExpirySeconds('soon')).toBe(604800);
  });
});
