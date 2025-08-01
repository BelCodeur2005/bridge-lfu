// Créez un fichier dashboard-context.tsx
import { createContext, useContext, ReactNode } from 'react';
import { DashboardStats, EquipmentStats, LicenseStats } from '@/types';
import { useDashboard, useEquipmentStats, useLicenseStats } from '@/hooks';

type DashboardContextType = {
  dashboardStats: DashboardStats | null;
  equipmentStats: EquipmentStats | null;
  licenseStats: LicenseStats | null;
};

const DashboardContext = createContext<DashboardContextType>({
  dashboardStats: null,
  equipmentStats: null,
  licenseStats: null
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { stats: dashboardStats } = useDashboard();
  const { stats: equipmentStats } = useEquipmentStats();
  const { stats: licenseStats } = useLicenseStats();

  return (
    <DashboardContext.Provider value={{ dashboardStats, equipmentStats, licenseStats }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  return useContext(DashboardContext);
}