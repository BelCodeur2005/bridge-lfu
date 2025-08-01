import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

// Fonction pour merger les classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utilitaires de dates
export const dateUtils = {
  format: (date: string | Date, formatStr: string = 'dd/MM/yyyy') => {
    return format(new Date(date), formatStr, { locale: fr })
  },
  
  formatRelative: (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: fr 
    })
  },
  
  isExpired: (date: string | Date) => {
    return isBefore(new Date(date), new Date())
  },
  
  isExpiringSoon: (date: string | Date, days: number = 30) => {
    const targetDate = new Date(date)
    const warningDate = addDays(new Date(), days)
    return isBefore(targetDate, warningDate) && isAfter(targetDate, new Date())
  },
  
  getDaysUntilExpiry: (date: string | Date) => {
    const targetDate = new Date(date)
    const today = new Date()
    const diffTime = targetDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

// Utilitaires de formatage
export const formatUtils = {
  currency: (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency
    }).format(amount)
  },
  
  percentage: (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  },
  
  fileSize: (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

// Utilitaires de validation
export const validationUtils = {
  isEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  isPhone: (phone: string) => {
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },
  
  isStrongPassword: (password: string) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password)
  }
}

// Utilitaires d'alerte
export const alertUtils = {
  getAlertLevel: (date: string | Date): 'urgent' | 'warning' | 'normal' | 'expired' => {
    const daysUntil = dateUtils.getDaysUntilExpiry(date)
    
    if (daysUntil < 0) return 'expired'
    if (daysUntil <= 7) return 'urgent'
    if (daysUntil <= 30) return 'warning'
    return 'normal'
  },
  
  getAlertColor: (level: string) => {
    switch (level) {
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  },
  
  getAlertMessage: (type: 'license' | 'equipment', daysUntil: number, itemName: string) => {
    if (daysUntil < 0) {
      return type === 'license' 
        ? `La licence "${itemName}" a expiré il y a ${Math.abs(daysUntil)} jour(s)`
        : `L'équipement "${itemName}" est obsolète depuis ${Math.abs(daysUntil)} jour(s)`
    }
    
    return type === 'license'
      ? `La licence "${itemName}" expire dans ${daysUntil} jour(s)`
      : `L'équipement "${itemName}" sera obsolète dans ${daysUntil} jour(s)`
  }
}

// Utilitaires de données
export const dataUtils = {
  groupBy: <T>(array: T[], key: keyof T) => {
    return array.reduce((groups, item) => {
      const value = String(item[key])
      if (!groups[value]) {
        groups[value] = []
      }
      groups[value].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },
  
  sortBy: <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
  },
  
  paginate: <T>(array: T[], page: number, limit: number) => {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return {
      data: array.slice(startIndex, endIndex),
      total: array.length,
      page,
      limit,
      totalPages: Math.ceil(array.length / limit)
    }
  }
}

// Utilitaires de local storage (pour les préférences)
export const storageUtils = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }
}


// Utilitaires d'URL
export const urlUtils = {
  buildQuery: (params: Record<string, unknown>) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    
    return searchParams.toString()
  },
  
  parseQuery: (search: string) => {
    const params = new URLSearchParams(search)
    const result: Record<string, string> = {}
    
    params.forEach((value, key) => {
      result[key] = value
    })
    
    return result
  }
}

// Constantes de l'application
export const APP_CONSTANTS = {
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  ALERTS: {
    LICENSE_WARNING_DAYS: [7, 30],
    EQUIPMENT_WARNING_DAYS: [30, 90]
  },
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/*', 'application/pdf', '.doc', '.docx', '.xlsx']
  }
} as const
//
