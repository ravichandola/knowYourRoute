/**
 * Public API of the vehicles module. Other modules may import ONLY from here.
 * Read access to vehicles is exposed through `VehiclesFacade`; everything else is private.
 */
export { VehiclesModule } from './vehicles.module';
export { VehiclesFacade } from './application/vehicles.facade';
