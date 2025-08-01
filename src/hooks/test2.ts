import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSupabaseClient} from '@/lib/supabase/client'
import { usePermissions } from '@/lib/auth/permissions'
import { useQuery } from '@tanstack/react-query'; // Importez useQuery
import type { 
  Profile, 
  Client, 
  License, 
  Equipment, 
  DashboardAlert, 
  DashboardStats,
  PaginatedResponse,
  PaginationParams, 
  LicenseStats,
  EquipmentStats
} from '@/types'

// Hook pour l'authentification
// Gère l'état de l'utilisateur connecté, le chargement initial et les fonctions d'authentification (signIn, signUp, signOut).
// Utilise onAuthStateChange pour réagir en temps réel aux changements d'état d'authentification.
export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    // Fonction asynchrone pour récupérer la session initiale
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Récupère le profil utilisateur si une session existe
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error("Erreur récupération du profil :", error)
          setUser(null)
        } else {
          setUser(profile)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    getSession()

    // Écouteur pour les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser(profile)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  // Fonction de connexion
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      throw error
    }
    return data
  }

  // Fonction d'inscription
  const signUp = async (
    email: string,
    password: string,
    profileData: Partial<Profile>
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone
        }
      }
    });

    if (error) {
      console.error("Erreur lors du signUp :", error);
      return { data: null, error };
    }

    const user = data.user;
    if (!user) {
      return {
        data: null,
        error: { message: "Veuillez confirmer votre email pour continuer." }
      };
    }

    // Ajoute une notification pour les administrateurs
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'new_unverified_user',
        title: 'Nouvel utilisateur à valider',
        message: `${profileData.first_name} ${profileData.last_name} (${email}) attend validation`,
        related_id: user.id,
        related_type: 'user'
      });

    if (notifError) {
      console.error("Erreur création de la notification :", notifError);
      return { data: { ...data, requiresAdminValidation: true }, error: notifError };
    }

    return {
      data: { ...data, requiresAdminValidation: true },
      error: null
    };
  };

  // Fonction de déconnexion
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
    }
    return { error }
  }

  // Fonction de réinitialisation de mot de passe
  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  }

  return {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }
}

// Hook pour les permissions
// Utilise le hook useAuth pour obtenir l'utilisateur et gère les permissions.
export function useAuthPermissions() {
  const { user } = useAuth()
  return usePermissions(user)
}

// Hook de permissions "stabilisé"
// Utilise useMemo pour mémoriser les valeurs des permissions et éviter des re-renderings inutiles.
// Utile pour les composants qui ont besoin de vérifier des permissions spécifiques.
export function useStablePermissions() {
  const permissions = useAuthPermissions()
  
  // Mémoriser les valeurs primitives plutôt que les objets
  const canViewAllData = useMemo(() => permissions.canViewAllData(), [permissions])
  const clientAccess = useMemo(() => permissions.getPermissions().clientAccess, [permissions])
  
  return useMemo(() => ({
    canViewAllData,
    clientAccess,
    canManageClients: permissions.can('create', 'clients') || permissions.can('update', 'clients'),
    canManageLicenses: permissions.can('create', 'licenses') || permissions.can('update', 'licenses'),
    canManageEquipment: permissions.can('create', 'equipment') || permissions.can('update', 'equipment'),
    canViewReports: permissions.can('read', 'reports'),
    can: permissions.can
  }), [canViewAllData, clientAccess, permissions.can])
}

// Hook pour le tableau de bord
// Utilise React-Query pour gérer le fetching, le cache, et la mise à jour des données du tableau de bord.
// La requête dépend des permissions pour adapter les données (vue admin vs vue client).
export function useDashboard() {
  const supabase = createSupabaseClient()
  const stablePermissions = useStablePermissions()
  const { canViewAllData, clientAccess } = stablePermissions

  const fetchDashboardData = async () => {
    // Récupération des alertes
    const alertsView = canViewAllData ? 'v_dashboard_alerts' : 'v_client_dashboard'
    let alertsQuery = supabase.from(alertsView).select('*')

    if (!canViewAllData && clientAccess) {
      alertsQuery = alertsQuery.eq('client_id', clientAccess)
    }

    const { data: alertsData, error: alertsError } = await alertsQuery
      .order('alert_date', { ascending: true })
      .limit(10)

    if (alertsError) {
      console.error("Erreur lors de la récupération des alertes:", alertsError)
      throw new Error(`Erreur alertes: ${alertsError.message}`)
    }
    const validAlerts: DashboardAlert[] = alertsData?.filter(alert => 
      alert && alert.id && alert.item_name && alert.alert_type && alert.alert_level && alert.status
    ) as DashboardAlert[] || []

    // Récupération des statistiques
    let dashboardStats: DashboardStats

    if (canViewAllData) {
        // Récupère toutes les statistiques pour l'admin
        const [clientsRes, licensesRes, equipmentRes] = await Promise.allSettled([
          supabase.from('clients').select('*', { count: 'exact', head: true }),
          supabase.from('licenses').select('status', { count: 'exact' }),
          supabase.from('equipment').select('status', { count: 'exact' })
        ]);

        const clientsCount =
          clientsRes.status === 'fulfilled' ? clientsRes.value.count ?? 0 : 0;

        const allLicenses =
          licensesRes.status === 'fulfilled' ? licensesRes.value.data ?? [] : [];

        const allEquipment =
          equipmentRes.status === 'fulfilled' ? equipmentRes.value.data ?? [] : [];

      dashboardStats = {
        total_clients: clientsCount,
        total_licenses: allLicenses.length,
        total_equipment: allEquipment.length,
        expired_licenses: allLicenses.filter(l => l.status === 'expired').length,
        about_to_expire_licenses: allLicenses.filter(l => l.status === 'about_to_expire').length,
        obsolete_equipment: allEquipment.filter(e => e.status === 'obsolete').length,
        soon_obsolete_equipment: allEquipment.filter(e => e.status === 'bientot_obsolete').length
      }
    } else {
      // Récupère les stats pour un client spécifique
      if (!clientAccess) {
        throw new Error("Accès client non défini pour les permissions restreintes.");
      }
      const [licensesRes, equipmentRes] = await Promise.allSettled([
        supabase.from('licenses').select('status').eq('client_id', clientAccess),
        supabase.from('equipment').select('status').eq('client_id', clientAccess)
      ])

      const clientLicenses = licensesRes.status === 'fulfilled' ? (licensesRes.value.data || []) : []
      const clientEquipment = equipmentRes.status === 'fulfilled' ? (equipmentRes.value.data || []) : []

      dashboardStats = {
        total_clients: 1, 
        total_licenses: clientLicenses.length,
        total_equipment: clientEquipment.length,
        expired_licenses: clientLicenses.filter(l => l.status === 'expired').length,
        about_to_expire_licenses: clientLicenses.filter(l => l.status === 'about_to_expire').length,
        obsolete_equipment: clientEquipment.filter(e => e.status === 'obsolete').length,
        soon_obsolete_equipment: clientEquipment.filter(e => e.status === 'bientot_obsolete').length
      }
    }

    return {
      stats: dashboardStats,
      alerts: validAlerts,
    }
  }

  // La clé de la requête est déterminée par les permissions pour s'assurer que le cache est mis à jour
  const queryKey = ['dashboardData', canViewAllData, clientAccess]

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,   
    refetchOnWindowFocus: true, 
    refetchOnReconnect: true,  
    retry: 3,  
  })

  return {
    stats: data?.stats || null,
    alerts: data?.alerts || [],
    loading: isLoading,
    error: isError ? (error as Error).message : null,
    refetch, 
  }
}

// Hook pour les statistiques d'équipements
// Utilise React-Query pour récupérer et traiter les données des équipements.
export function useEquipmentStats() {
  const supabase = createSupabaseClient()
  const stablePermissions = useStablePermissions()
  const { canViewAllData, clientAccess } = stablePermissions

  const fetchEquipmentStats = async () => {
    let equipmentQuery = supabase.from('equipment').select('type, status, client_id')
    
    if (!canViewAllData && clientAccess) {
      equipmentQuery = equipmentQuery.eq('client_id', clientAccess)
    }

    const { data: equipment, error: equipmentError } = await equipmentQuery

    if (equipmentError) {
      console.error("Erreur lors de la récupération des équipements:", equipmentError)
      throw new Error(`Erreur équipements: ${equipmentError.message}`)
    }

    const validEquipment = equipment?.filter(item => item.type && item.status) || []

    if (validEquipment.length === 0) {
      return {
        total: 0,
        byType: {},
        byStatus: {},
        chartData: { types: [], statuses: [] }
      } as EquipmentStats
    }

    // Calcule les statistiques par type et par statut
    const typeStats = validEquipment.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusStats = validEquipment.reduce((acc, item) => {
      acc[item.status || 'unknown'] = (acc[item.status || 'unknown'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Construit l'objet final des statistiques
    const newStats: EquipmentStats = {
      total: validEquipment.length,
      byType: typeStats,
      byStatus: statusStats,
      chartData: {
        types: Object.entries(typeStats).map(([type, count]) => ({
          name: type,
          value: count,
          percentage: Math.round((count / validEquipment.length) * 100)
        })),
        statuses: Object.entries(statusStats).map(([status, count]) => ({
          name: status,
          value: count,
          percentage: Math.round((count / validEquipment.length) * 100)
        }))
      }
    }
    return newStats
  }

  const queryKey = ['equipmentStats', canViewAllData, clientAccess]

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: fetchEquipmentStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  })

  return { 
    stats: data || null, 
    loading: isLoading, 
    error: isError ? (error as Error).message : null, 
    refetch 
  }
}

// Hook pour les statistiques de licences
// Utilise React-Query pour récupérer et traiter les données des licences.
export function useLicenseStats() {
  const supabase = createSupabaseClient()
  const stablePermissions = useStablePermissions()
  const { canViewAllData, clientAccess } = stablePermissions

  const fetchLicenseStats = async () => {
    let licensesQuery = supabase.from('licenses').select('status, expiry_date, client_id, cost')
    
    if (!canViewAllData && clientAccess) {
      licensesQuery = licensesQuery.eq('client_id', clientAccess)
    }

    const { data: licenses, error: licensesError } = await licensesQuery

    if (licensesError) {
      console.error("Erreur lors de la récupération des licences:", licensesError)
      throw new Error(`Erreur licences: ${licensesError.message}`)
    }

    const validLicenses = licenses?.filter(license => 
      license.status && license.expiry_date
    ) || []

    if (validLicenses.length === 0) {
      return {
        total: 0,
        byStatus: {},
        totalValue: 0,
        monthlyExpiry: [],
        chartData: { statuses: [], expiry: [] }
      } as LicenseStats
    }

    // Calcule les statistiques par statut et la valeur totale
    const statusStats = validLicenses.reduce((acc, item) => {
      acc[item.status || 'unknown'] = (acc[item.status || 'unknown'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calcule les expirations mensuelles pour les 6 prochains mois
    const monthlyExpiry = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      const monthKey = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' })
      
      const count = validLicenses.filter(license => {
        if (!license.expiry_date) return false
        const expiryDate = new Date(license.expiry_date)
        return expiryDate.getMonth() === date.getMonth() &&
                 expiryDate.getFullYear() === date.getFullYear()
      }).length

      return { month: monthKey, count }
    })

    const totalValue = validLicenses.reduce((sum, license) => sum + (license.cost || 0), 0)

    // Construit l'objet final des statistiques
    const newStats: LicenseStats = {
      total: validLicenses.length,
      byStatus: statusStats,
      totalValue,
      monthlyExpiry,
      chartData: {
        statuses: Object.entries(statusStats).map(([status, count]) => ({
          name: status,
          value: count,
          percentage: Math.round((count / validLicenses.length) * 100)
        })),
        expiry: monthlyExpiry.filter(item => item.count > 0)
      }
    }
    return newStats
  }

  const queryKey = ['licenseStats', canViewAllData, clientAccess]

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: fetchLicenseStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  })

  return { 
    stats: data || null, 
    loading: isLoading, 
    error: isError ? (error as Error).message : null, 
    refetch 
  }
}

// Hook pour la liste des licences
// Gère la pagination, le filtrage et la récupération des licences.
export function useLicenses(params?: PaginationParams & { 
  clientId?: string; 
  search?: string; 
  status?: string 
}) {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ count: 0, page: 1, totalPages: 1 })
  
  const supabase = createSupabaseClient()
  const stablePermissions = useStablePermissions()

  const fetchLicenses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('v_licenses_with_client')
        .select('*', { count: 'exact' })

      // Filtre par permissions
      if (!stablePermissions.canViewAllData && stablePermissions.clientAccess) {
        query = query.eq('client_id', stablePermissions.clientAccess)
      }

      // Filtre par client ID, recherche et statut
      if (params?.clientId) {
        query = query.eq('client_id', params.clientId)
      }
      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`)
      }

      const validStatuses = ['active', 'expired', 'about_to_expire', 'cancelled'] as const
      if (params?.status && validStatuses.includes(params.status as typeof validStatuses[number])) {
        query = query.eq('status', params.status as typeof validStatuses[number])
      }

      // Gère la pagination
      const limit = params?.limit || 10
      const offset = ((params?.page || 1) - 1) * limit
      query = query.range(offset, offset + limit - 1)
      query = query.order('expiry_date', { ascending: true })

      const { data, error, count } = await query

      if (error) throw error

      setLicenses(data?.filter(lic => lic.id !== null) as License[] || [])
      setPagination({
        count: count || 0,
        page: params?.page || 1,
        totalPages: Math.ceil((count || 0) / limit)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [params, stablePermissions, supabase])

  useEffect(() => {
    fetchLicenses()
  }, [fetchLicenses])

  return {
    licenses,
    loading,
    error,
    pagination,
    refetch: fetchLicenses
  }
}

// Hook pour la liste des équipements
// Gère la pagination, le filtrage et la récupération des équipements.
export function useEquipment(params?: PaginationParams & { 
  clientId?: string; 
  search?: string; 
  type?: string;
  status?: string 
}) {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ count: 0, page: 1, totalPages: 1 })
  
  const supabase = createSupabaseClient()
  const stablePermissions = useStablePermissions()

  const fetchEquipment = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('v_equipment_with_client')
        .select('*', { count: 'exact' })

      // Filtre par permissions
      if (!stablePermissions.canViewAllData && stablePermissions.clientAccess) {
        query = query.eq('client_id', stablePermissions.clientAccess)
      }

      // Filtre par client ID, recherche, type et statut
      if (params?.clientId) {
        query = query.eq('client_id', params.clientId)
      }
      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`)
      }

      const validTypes = ["pc", "serveur", "routeur", "switch", "imprimante", "autre"] as const
      if (params?.type && validTypes.includes(params.type as typeof validTypes[number])) {
        query = query.eq('type', params.type as typeof validTypes[number])
      }

      const validStatuses = ["actif", "en_maintenance", "obsolete", "bientot_obsolete", "retire"] as const
      if (params?.status && validStatuses.includes(params.status as typeof validStatuses[number])) {
        query = query.eq('status', params.status as typeof validStatuses[number])
      }

      // Gère la pagination
      const limit = params?.limit || 10
      const offset = ((params?.page || 1) - 1) * limit
      query = query.range(offset, offset + limit - 1)
      query = query.order('estimated_obsolescence_date', { 
        ascending: true,
        nullsFirst: false 
      })

      const { data, error, count } = await query

      if (error) throw error

      setEquipment(data?.filter(eq => eq.id !== null) as Equipment[] || [])
      setPagination({
        count: count || 0,
        page: params?.page || 1,
        totalPages: Math.ceil((count || 0) / limit)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [params, stablePermissions, supabase])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  return {
    equipment,
    loading,
    error,
    pagination,
    refetch: fetchEquipment
  }
}

// Hook pour l'abonnement en temps réel à une table Supabase
// Utile pour les mises à jour instantanées de l'UI.
export function useRealtimeSubscription(table: string, callback: (payload: unknown) => void) {
  const supabase = createSupabaseClient()

  useEffect(() => {
    const subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
        callback
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, callback, supabase])
}

// Hook pour le "debounce" des valeurs
// Retarde la mise à jour d'une valeur jusqu'à ce qu'un certain délai s'écoule.
// Particulièrement utile pour les barres de recherche pour éviter les requêtes à chaque frappe.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook pour la pagination
// Fournit l'état et les fonctions nécessaires pour gérer la pagination dans les listes.
export function usePagination(initialPage: number = 1, initialLimit: number = 10) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const goToNextPage = useCallback(() => {
    setPage(prev => prev + 1)
  }, [])

  const goToPreviousPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1))
  }, [])

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  const reset = useCallback(() => {
    setPage(initialPage)
    setLimit(initialLimit)
  }, [initialPage, initialLimit])

  return {
    page,
    limit,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changeLimit,
    reset
  }
}
// Fonction de fetching pour useClients
// Cette fonction est le "queryFn" pour React-Query, responsable de la logique de récupération des clients.
const fetchClients = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  params: PaginationParams & { search?: string,sector?: string },
  permissions: ReturnType<typeof useStablePermissions>, 
): Promise<PaginatedResponse<Client>> => {
  let query = supabase.from('clients').select('*', { count: 'exact' });

  // Applique le filtrage basé sur le rôle utilisateur.
  if (!permissions.canViewAllData && permissions.clientAccess) {
    query = query.eq('id', permissions.clientAccess);
  }

  // Applique les filtres de recherche et de secteur.
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }
  if (params.sector) {
    query = query.eq('sector', params.sector);
  }
  
  // Applique les paramètres de pagination.
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { data: data as Client[], count: count ?? 0 };
};

// Hook useClients
// Utilise React-Query pour gérer le fetching, le caching et la synchronisation des données des clients.
// La requête est activée si l'utilisateur est authentifié et si les permissions sont prêtes.
export function useClients(params: PaginationParams & { search?: string,sector?: string }) {
  const supabase = createSupabaseClient();
  const {isAuthenticated } = useAuth(); 
  const permissions = useStablePermissions(); 

  return useQuery({
    queryKey: ['clients', params, permissions],
    queryFn: () => fetchClients(supabase, params, permissions),
    enabled: isAuthenticated,
  });
}

// Fonction de fetching pour useClient (par ID)
const fetchClientById = async (supabase: ReturnType<typeof createSupabaseClient>, id: string): Promise<Client> => {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Hook useClient
// Utilise React-Query pour récupérer un seul client par son ID.
export function useClient(id: string) {
  const supabase = createSupabaseClient();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClientById(supabase, id),
    enabled: isAuthenticated && !!id,
  });
}
// Fonction de fetching pour récupérer la liste des secteurs
const fetchSectors = async (supabase: ReturnType<typeof createSupabaseClient>): Promise<string[]> => {
  const { data, error } = await supabase.from('clients').select('sector').not('sector', 'is', null);

  if (error) {
    throw new Error(error.message);
  }

  const sectors = data.map((item) => item.sector).filter(Boolean) as string[];
  const uniqueSectors = [...new Set(sectors)].sort();

  return uniqueSectors;
};

// Hook useSectors
// Utilise React-Query pour récupérer la liste unique et triée des secteurs de clients.
export function useSectors() {
  const supabase = createSupabaseClient();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['sectors'],
    queryFn: () => fetchSectors(supabase),
    enabled: isAuthenticated,
    staleTime: Infinity, // Les secteurs ne changent pas souvent, on peut les cacher indéfiniment
  });
}
