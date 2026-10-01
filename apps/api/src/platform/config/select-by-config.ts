import { ConfigService } from '@nestjs/config';

/**
 * Picks an implementation from an explicit environment switch (e.g. `MAP_PROVIDER=mock`).
 * Unknown values fail at boot instead of silently falling back to a different implementation.
 */
export function selectByConfig<T>(
  config: ConfigService,
  key: string,
  options: Record<string, T>,
  defaultValue: string
): T {
  const selected = config.get<string>(key, defaultValue);
  const implementation = options[selected];
  if (implementation === undefined) {
    throw new Error(
      `Unsupported ${key}="${selected}". Supported values: ${Object.keys(options).join(', ')}`
    );
  }
  return implementation;
}
