/** Public API of the vehicles feature. Other features import ONLY from here. */
export { useVehicleStore } from './store/vehicle.store';
export { useVehicles, useRegisterVehicle, useUploadVehicleSnapshot } from './hooks/useVehicles';
export { VehicleCard } from './components/VehicleCard';
export { default as VehicleScreen } from './screens/VehicleScreen';
