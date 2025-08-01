import { UserRole, Profile } from '@/types'

export interface Permission {
  action: string
  resource: string
  condition?: (user: Profile, resourceData?: Record<string, unknown>) => boolean
}

// Définition des permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    admin: [

        { resource: 'dashboard', action: 'read' },
        // Gestion complète de tous les clients
        { action: 'create', resource: 'clients' },
        { action: 'read', resource: 'clients' },
        { action: 'update', resource: 'clients' },
        { action: 'delete', resource: 'clients' },

        // Gestion complète des licences
        { action: 'create', resource: 'licenses' },
        { action: 'read', resource: 'licenses' },
        { action: 'update', resource: 'licenses' },
        { action: 'delete', resource: 'licenses' },

        // Gestion complète des équipements
        { action: 'create', resource: 'equipment' },
        { action: 'read', resource: 'equipment' },
        { action: 'update', resource: 'equipment' },
        { action: 'delete', resource: 'equipment' },

        // Gestion des utilisateurs
        { action: 'create', resource: 'users' },
        { action: 'read', resource: 'users' },
        { action: 'update', resource: 'users' },
        { action: 'delete', resource: 'users' },

        // Rapports et analytics
        { action: 'read', resource: 'reports' },
        { action: 'export', resource: 'reports' },

        // Notifications et paramètres système
        { action: 'read', resource: 'notifications' },
        { action: 'manage', resource: 'system_settings' },

        // Logs d'activité
        { action: 'read', resource: 'activity_logs' }
    ],

    technicien: [
        { resource: 'dashboard', action: 'read' },
        // Gestion complète des clients
        { action: 'create', resource: 'clients' },
        { action: 'read', resource: 'clients' },
        { action: 'update', resource: 'clients' },
        { action: 'delete', resource: 'clients' },

        // Gestion complète des licences
        { action: 'create', resource: 'licenses' },
        { action: 'read', resource: 'licenses' },
        { action: 'update', resource: 'licenses' },
        { action: 'delete', resource: 'licenses' },

        // Gestion complète des équipements
        { action: 'create', resource: 'equipment' },
        { action: 'read', resource: 'equipment' },
        { action: 'update', resource: 'equipment' },
        { action: 'delete', resource: 'equipment' },

        // Lecture des utilisateurs (pas de création/modification)
        { action: 'read', resource: 'users' },

        // Rapports
        { action: 'read', resource: 'reports' },
        { action: 'export', resource: 'reports' },

        // Notifications
        { action: 'read', resource: 'notifications' }
    ],

    client: [
        { resource: 'dashboard', action: 'read' },
        // Lecture limitée aux données de son propre client
        {
            action: 'read',
            resource: 'clients',
            condition: (user, resourceData) => {
                return user.client_id === resourceData?.id
            }
        },

        // Lecture des licences de son client uniquement
        {
            action: 'read',
            resource: 'licenses',
            condition: (user, resourceData) => {
                return user.client_id === resourceData?.client_id
            }
        },

        // Lecture des équipements de son client uniquement
        {
            action: 'read',
            resource: 'equipment',
            condition: (user, resourceData) => {
                return user.client_id === resourceData?.client_id
            }
        },

        // Lecture de son propre profil uniquement
        {
            action: 'read',
            resource: 'users',
            condition: (user, resourceData) => {
                return user.id === resourceData?.id
            }
        },

        // Mise à jour de son propre profil uniquement
        {
            action: 'update',
            resource: 'users',
            condition: (user, resourceData) => {
                return user.id === resourceData?.id
            }
        },

        // Rapports limités à ses données
        {
            action: 'read',
            resource: 'reports',
            condition: (user, resourceData) => {
                return user.client_id === resourceData?.client_id
            }
        },

        // Notifications personnelles
        {
            action: 'read',
            resource: 'notifications',
            condition: (user, resourceData) => {
                return user.id === resourceData?.user_id
            }
        }
    ],
    unverified: []
}

// Classe pour vérifier les permissions
export class PermissionChecker {
  private user: Profile

  constructor(user: Profile) {
    this.user = user
  }

  /**
   * Vérifie si l'utilisateur a la permission pour une action sur une ressource
   */
  can(action: string, resource: string, resourceData?: unknown): boolean {
    if (!this.user.role) return false

    const rolePermissions = ROLE_PERMISSIONS[this.user.role]
    if (!rolePermissions) return false

    const permission = rolePermissions.find(
      p => p.action === action && p.resource === resource
    )

    if (!permission) return false

    // Si la permission a une condition, la vérifier
    if (permission.condition) {
    if (resourceData && typeof resourceData === "object") {
        return permission.condition(this.user, resourceData as Record<string, unknown>)
    }
    return permission.condition(this.user, undefined)
    }


    return true
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux données d'un client spécifique
   */
  canAccessClient(clientId: string): boolean {
    if (this.user.role === 'admin' || this.user.role === 'technicien') {
      return true
    }

    if (this.user.role === 'client') {
      return this.user.client_id === clientId
    }

    return false
  }
  /**
   * Vérifie si l'utilisateur peut voir toutes les données (admin/technicien)
   */
  canViewAllData(): boolean {
    return this.user.role === 'admin' || this.user.role === 'technicien'
  }

  /**
   * Vérifie si l'utilisateur peut gérer les utilisateurs
   */
  canManageUsers(): boolean {
    return this.user.role === 'admin'
  }

  /**
   * Vérifie si l'utilisateur peut voir les logs d'activité
   */
  canViewActivityLogs(): boolean {
    return this.user.role === 'admin'
  }

  /**
   * Vérifie si l'utilisateur peut exporter des rapports
   */
  canExportReports(): boolean {
    return this.user.role === 'admin' || this.user.role === 'technicien'
  }

  /**
   * Retourne les permissions de l'utilisateur sous forme d'objet
   */
  getPermissions() {
    const permissions = {
      canManageClients: this.can('create', 'clients') || this.can('update', 'clients') || this.can('delete', 'clients'),
      canManageLicenses: this.can('create', 'licenses') || this.can('update', 'licenses') || this.can('delete', 'licenses'),
      canManageEquipment: this.can('create', 'equipment') || this.can('update', 'equipment') || this.can('delete', 'equipment'),
      canViewReports: this.can('read', 'reports'),
      canManageUsers: this.can('create', 'users') || this.can('update', 'users') || this.can('delete', 'users'),
      canViewAllData: this.canViewAllData(),
      clientAccess: this.user.role === 'client' ? this.user.client_id : undefined
    }

    return permissions
  }
}

// Hook pour utiliser les permissions dans les composants React
export function usePermissions(user?: Profile | null) {
  if (!user) {
    return {
      can: () => false,
      canAccessClient: () => false,
      canViewAllData: () => false,
      canManageUsers: () => false,
      canViewActivityLogs: () => false,
      canExportReports: () => false,
      getPermissions: () => ({
        canManageClients: false,
        canManageLicenses: false,
        canManageEquipment: false,
        canViewReports: false,
        canManageUsers: false,
        canViewAllData: false,
        clientAccess: undefined
      })
    }
  }

  const checker = new PermissionChecker(user)

  return {
    can: checker.can.bind(checker),
    canAccessClient: checker.canAccessClient.bind(checker),
    canViewAllData: checker.canViewAllData.bind(checker),
    canManageUsers: checker.canManageUsers.bind(checker),
    canViewActivityLogs: checker.canViewActivityLogs.bind(checker),
    canExportReports: checker.canExportReports.bind(checker),
    getPermissions: checker.getPermissions.bind(checker)
  }
}

// Middleware pour vérifier les permissions côté serveur
export function requirePermission(action: string, resource: string) {
  return (user: Profile, resourceData?: unknown): boolean => {
    const checker = new PermissionChecker(user)
    return checker.can(action, resource, resourceData)
  }
}

// Utilitaires pour les conditions RLS Supabase
export const RLS_CONDITIONS = {
  // Condition pour les clients - les utilisateurs client ne voient que leur client
  clientAccess: (userId: string) => `
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '${userId}' 
        AND role IN ('admin', 'technicien')
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '${userId}' 
        AND role = 'client' 
        AND client_id = clients.id
      )
    )
  `,

  // Condition pour les licences
  licenseAccess: (userId: string) => `
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '${userId}' 
        AND role IN ('admin', 'technicien')
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '${userId}' 
        AND role = 'client' 
        AND client_id = licenses.client_id
      )
    )
  `,

  // Condition pour les équipements
  equipmentAccess: (userId: string) => `
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '${userId}' 
        AND role IN ('admin', 'technicien')
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '${userId}' 
        AND role = 'client' 
        AND client_id = equipment.client_id
      )
    )
  `
}