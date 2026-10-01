import { create } from 'zustand';
import { VehicleProfile } from '@know-your-route/contracts';

interface VehicleStoreState {
  selectedVehicleId: string | null;
  activeVehicle: VehicleProfile | null;
  setSelectedVehicle: (vehicle: VehicleProfile | null) => void;
  setSelectedVehicleId: (id: string | null) => void;
}

export const useVehicleStore = create<VehicleStoreState>((set) => ({
  selectedVehicleId: 'veh_demo_creta',
  activeVehicle: null,
  setSelectedVehicle: (activeVehicle) =>
    set({
      activeVehicle,
      selectedVehicleId: activeVehicle ? activeVehicle.id : null,
    }),
  setSelectedVehicleId: (selectedVehicleId) => set({ selectedVehicleId }),
}));
