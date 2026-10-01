/**
 * Everything route planning needs from the outside world, declared from ITS point of view.
 * Adapters in `infrastructure/` implement these; the use case never knows who is behind them.
 * One file per port so a new capability (places, traffic, ...) adds a file, not a bigger one.
 */
export * from './fastag-balance.port';
export * from './plan-cache.port';
export * from './routing.port';
export * from './vehicle-lookup.port';
export * from './weather.port';
