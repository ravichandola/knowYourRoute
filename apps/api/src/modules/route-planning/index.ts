/**
 * Public API of the route-planning module. Nothing else in the app depends on its internals.
 * Route planning is a leaf use case: it consumes `vehicles` and `fastag`, and nobody consumes it.
 */
export { RoutePlanningModule } from './route-planning.module';
