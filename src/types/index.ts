import { Database } from './database'

// Types de base exportés depuis la database
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Types spécifiques aux entités
export type Profile = Tables<'profiles'>
export type Client = Tables<'clients'>
export type License = Tables<'licenses'>
export type Equipment = Tables<'equipment'>
export type Notification = Tables<'notifications'>
export type NotificationSettings = Tables<'notification_settings'>
export type ActivityLog = Tables<'activity_logs'>

// Types pour les insertions
export type ProfileInsert = TablesInsert<'profiles'>
export type ClientInsert = TablesInsert<'clients'>
export type LicenseInsert = TablesInsert<'licenses'>
export type EquipmentInsert = TablesInsert<'equipment'>

// Types pour les mises à jour
export type ProfileUpdate = TablesUpdate<'profiles'>
export type ClientUpdate = TablesUpdate<'clients'>
export type LicenseUpdate = TablesUpdate<'licenses'>
export type EquipmentUpdate = TablesUpdate<'equipment'>

// Types d'énumérations
export type UserRole = Enums<'user_role'>
export type EquipmentStatus = Enums<'equipment_status'>
export type EquipmentType = Enums<'equipment_type'>
export type LicenseStatus = Enums<'license_status'>
export type NotificationType = Enums<'notification_type'>

// Types étendus avec relations
export interface ClientWithStats extends Client {
  licenses_count: number
  equipment_count: number
  expired_licenses: number
  obsolete_equipment: number
}
  
export interface LicenseWithClient extends License {
  client?: Pick<Client, 'id' | 'name' | 'contact_email'>
  created_by_name?: string
}

export interface EquipmentWithClient extends Equipment {
  client?: Pick<Client, 'id' | 'name' | 'contact_email'>
  created_by_name?: string
}

// Types pour les alertes du dashboard
export interface DashboardAlert {
  id: string
  type: 'license' | 'equipment'
  item_name: string
  client_name?: string
  client_id?: string
  alert_date: string
  alert_level: 'urgent' | 'warning' | 'normal' | 'expired'
  alert_type: string
  status: string
}

// Types pour les statistiques
export interface DashboardStats {
  total_clients: number
  total_licenses: number
  total_equipment: number
  expired_licenses: number
  about_to_expire_licenses: number
  obsolete_equipment: number
  soon_obsolete_equipment: number
}
// NOUVEAUX TYPES pour les graphiques et statistiques avancées
export interface ChartDataPoint {
  name: string
  value: number
  percentage?: number
  color?: string
}

export interface ChartData {
  types?: ChartDataPoint[]
  statuses?: ChartDataPoint[]
  expiry?: Array<{ month: string; count: number }>
}

export interface EquipmentStats {
  total: number
  byType: Record<string, number>
  byStatus: Record<string, number>
  chartData: {
    types: ChartDataPoint[]
    statuses: ChartDataPoint[]
  }
}

export interface LicenseStats {
  total: number
  byStatus: Record<string, number>
  totalValue: number
  monthlyExpiry: Array<{ month: string; count: number }>
  chartData: {
    statuses: ChartDataPoint[]
    expiry: Array<{ month: string; count: number }>
  }
}
  
// Types pour les filtres
export interface ClientFilters {
  search?: string
  sector?: string
}

export interface LicenseFilters {
  search?: string
  client_id?: string
  status?: LicenseStatus
  expiry_range?: {
    start: string
    end: string
  }
}

export interface EquipmentFilters {
  search?: string
  client_id?: string
  type?: EquipmentType
  status?: EquipmentStatus
  brand?: string
}

// Types pour les formulaires
export interface ClientFormData {
  name: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  contact_email?: string
  contact_phone?: string
  contact_person?: string
  sector?: string
}

export interface LicenseFormData {
  name: string
  editor?: string
  version?: string
  license_key?: string
  purchase_date?: string
  expiry_date: string
  cost?: number
  client_id: string
  description?: string
}

export interface EquipmentFormData {
  name: string
  type: EquipmentType
  brand?: string
  model?: string
  serial_number?: string
  purchase_date?: string
  estimated_obsolescence_date?: string
  end_of_sale?: string
  cost?: number
  client_id: string
  location?: string
  description?: string
  warranty_end_date?: string
}

// Types pour les rapports
export interface LicenseReport {
  license_name: string
  client_name: string
  expiry_date: string
  status: LicenseStatus
  cost?: number
  days_until_expiry: number
}

export interface EquipmentReport {
  equipment_name: string
  client_name: string
  type: EquipmentType
  brand?: string
  model?: string
  status: EquipmentStatus
  obsolescence_date?: string
  days_until_obsolescence?: number
}

// Types pour l'authentification
export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

// Types pour les réponses API
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Types pour les paramètres de pagination
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Types pour les notifications en temps réel
export interface RealtimePayload<T = unknown> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
  table: string
}

// Types pour les permissions
export interface UserPermissions {
  canManageClients: boolean
  canManageLicenses: boolean
  canManageEquipment: boolean
  canViewReports: boolean
  canManageUsers: boolean
  canViewAllData: boolean
  clientAccess?: string // ID du client pour les utilisateurs client
}




// NOUVEAUX TYPES pour les graphiques avancés
export interface TrendData {
  period: string
  licenses: number
  equipment: number
  alerts: number
}

export interface AlertTrend {
  date: string
  urgent: number
  warning: number
  normal: number
}

export interface ClientStatsOverview {
  client_id: string
  client_name: string
  total_licenses: number
  total_equipment: number
  active_alerts: number
  total_value: number
}

// Types pour les métriques de performance
export interface PerformanceMetrics {
  response_time: number
  uptime_percentage: number
  error_rate: number
  active_users: number
}

// Types pour les préférences utilisateur
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'fr' | 'en'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  dashboard: {
    defaultView: 'cards' | 'table' | 'charts'
    itemsPerPage: number
    autoRefresh: boolean
    refreshInterval: number
  }
}

// Types pour l'export de données
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf'
  dateRange?: {
    start: string
    end: string
  }
  includeArchived: boolean
  filters?: Record<string, unknown>
}

export interface ExportResult {
  url: string
  filename: string
  size: number
  created_at: string
  expires_at: string
} 
//
// Types pour les vues de la base de données
export interface DashboardAlertView {
  id: string | null
  type: string | null
  item_name: string | null
  client_name?: string | null
  client_id: string | null
  alert_date: string | null
  alert_level: string | null
  alert_type: string | null
  status: string | null
}

export interface LicenseWithClientView {
  id: string | null
  name: string | null
  editor: string | null
  version: string | null
  license_key: string | null
  purchase_date: string | null
  expiry_date: string | null
  cost: number | null
  client_id: string | null
  status: LicenseStatus | null
  description: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  client_name: string | null
  client_email: string | null
  created_by_name: string | null
}

export interface EquipmentWithClientView {
  id: string | null
  name: string | null
  type: EquipmentType | null
  brand: string | null
  model: string | null
  serial_number: string | null
  purchase_date: string | null
  estimated_obsolescence_date: string | null
  actual_obsolescence_date: string | null
  end_of_sale: string | null
  status: EquipmentStatus | null
  cost: number | null
  client_id: string | null
  location: string | null
  description: string | null
  warranty_end_date: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  client_name: string | null
  client_email: string | null
  created_by_name: string | null
}