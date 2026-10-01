const DEFAULT_EXPIRY_SECONDS = 604800;
const UNIT_SECONDS = { s: 1, m: 60, h: 3600, d: 86400 } as const;

/** `'7d'` -> `604800`. Falls back to 7 days for unparseable values. */
export function toExpirySeconds(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) {
    return DEFAULT_EXPIRY_SECONDS;
  }
  return Number(match[1]) * UNIT_SECONDS[match[2] as keyof typeof UNIT_SECONDS];
}
