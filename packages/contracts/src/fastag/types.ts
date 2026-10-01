export interface FastagContext {
  tagId: string;
  bankName: string;
  currentBalance: number;
  currency: string;
  isBalanceSufficientForTrip: boolean;
  shortfallAmount?: number;
  lowBalanceWarning: boolean;
  lastUpdated: string;
}

export interface FastagConnection {
  id: string;
  userId: string;
  vehicleId: string;
  tagNumber: string;
  bankName: string;
  balance: number;
  status: 'ACTIVE' | 'LOW_BALANCE' | 'INACTIVE';
}
