// Dashboard Types
// Export feature-specific type definitions here

export interface DashboardStats {
  totalWarta: number;
  totalPengumuman: number;
  totalJadwal: number;
  totalUsers: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'counter' | 'list';
  data: unknown;
}
