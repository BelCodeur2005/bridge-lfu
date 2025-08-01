import { z } from 'zod'

// Schémas de base
const emailSchema = z.string().email('Email invalide')
const phoneSchema = z
  .string()
  .regex(/^(\+237|6)[0-9]{8}$/, 'Numéro de téléphone invalide')
  .optional()
  .or(z.literal(''));
  const passwordSchema = z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')

// Schéma d'authentification
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis')
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  company: z.string().optional(),
  phone: phoneSchema
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

export const resetPasswordSchema = z.object({
  email: emailSchema
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

// Schéma de profil utilisateur
export const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: emailSchema,
  company: z.string().optional(),
  phone: phoneSchema,
  role: z.enum(['admin', 'technicien', 'client']).optional()
})

// Schéma client
export const clientSchema = z.object({
  name: z.string().min(2, 'Le nom du client doit contenir au moins 2 caractères'),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Cameroun'),
  contactEmail: emailSchema.optional().or(z.literal('')),
  contactPhone: phoneSchema,
  contactPerson: z.string().optional(),
  sector: z.string().optional()
})

// Schéma licence
export const licenseSchema = z.object({
  name: z.string().min(2, 'Le nom de la licence doit contenir au moins 2 caractères'),
  editor: z.string().optional(),
  version: z.string().optional(),
  licenseKey: z.string().optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Date d\'expiration requise'),
  cost: z.number().min(0, 'Le coût doit être positif').optional(),
  clientId: z.string().uuid('Client requis'),
  description: z.string().optional()
}).refine(data => {
  if (data.purchaseDate && data.expiryDate) {
    return new Date(data.expiryDate) >= new Date(data.purchaseDate)
  }
  return true
}, {
  message: 'La date d\'expiration doit être postérieure à la date d\'achat',
  path: ['expiryDate']
})

// Schéma équipement
export const equipmentSchema = z.object({
  name: z.string().min(2, 'Le nom de l\'équipement doit contenir au moins 2 caractères'),
  type: z.enum(['pc', 'serveur', 'routeur', 'switch', 'imprimante', 'autre']),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  estimatedObsolescenceDate: z.string().optional(),
  endOfSale: z.string().optional(),
  cost: z.number().min(0, 'Le coût doit être positif').optional(),
  clientId: z.string().uuid('Client requis'),
  location: z.string().optional(),
  description: z.string().optional(),
  warrantyEndDate: z.string().optional()
}).refine(data => {
  // Vérification des dates cohérentes
  const purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null
  const obsolescenceDate = data.estimatedObsolescenceDate ? new Date(data.estimatedObsolescenceDate) : null
  const endOfSaleDate = data.endOfSale ? new Date(data.endOfSale) : null
  const warrantyDate = data.warrantyEndDate ? new Date(data.warrantyEndDate) : null

  // La date d'obsolescence doit être après la date d'achat
  if (purchaseDate && obsolescenceDate && obsolescenceDate < purchaseDate) {
    return false
  }

  // La date de fin de commercialisation doit être après la date d'achat
  if (purchaseDate && endOfSaleDate && endOfSaleDate < purchaseDate) {
    return false
  }

  // La date de fin de garantie doit être après la date d'achat
  if (purchaseDate && warrantyDate && warrantyDate < purchaseDate) {
    return false
  }

  return true
}, {
  message: 'Les dates doivent être cohérentes',
  path: ['estimatedObsolescenceDate']
})

// Schéma de paramètres de notification
export const notificationSettingsSchema = z.object({
  licenseAlertDays: z.array(z.number().min(1).max(365)).default([7, 30]),
  equipmentAlertDays: z.array(z.number().min(1).max(365)).default([30, 90]),
  emailEnabled: z.boolean().default(true)
})

// Schéma de recherche/filtres
export const searchSchema = z.object({
  query: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export const clientFiltersSchema = searchSchema.extend({
  sector: z.string().optional()
})

export const licenseFiltersSchema = searchSchema.extend({
  clientId: z.string().uuid().optional(),
  status: z.enum(['active', 'expired', 'about_to_expire', 'cancelled']).optional(),
  editor: z.string().optional(),
  expiryDateStart: z.string().optional(),
  expiryDateEnd: z.string().optional()
})

export const equipmentFiltersSchema = searchSchema.extend({
  clientId: z.string().uuid().optional(),
  type: z.enum(['pc', 'serveur', 'routeur', 'switch', 'imprimante', 'autre']).optional(),
  status: z.enum(['actif', 'en_maintenance', 'obsolete', 'bientot_obsolete', 'retire']).optional(),
  brand: z.string().optional()
})

// Schéma de rapport
export const reportConfigSchema = z.object({
  type: z.enum(['licenses', 'equipment', 'alerts', 'clients']),
  format: z.enum(['pdf', 'csv']),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  filters: z.object({
    clientIds: z.array(z.string().uuid()).optional(),
    status: z.array(z.string()).optional(),
    includeExpired: z.boolean().default(true)
  }).optional()
})

// Schéma d'upload de fichier
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['contract', 'invoice', 'certificate', 'manual', 'warranty', 'other']).default('other')
}).refine(data => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return data.file.size <= maxSize
}, {
  message: 'Le fichier ne doit pas dépasser 10MB'
}).refine(data => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  return allowedTypes.includes(data.file.type)
}, {
  message: 'Type de fichier non autorisé'
})

// Types inférés des schémas
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type LicenseInput = z.infer<typeof licenseSchema>
export type EquipmentInput = z.infer<typeof equipmentSchema>
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type ClientFiltersInput = z.infer<typeof clientFiltersSchema>
export type LicenseFiltersInput = z.infer<typeof licenseFiltersSchema>
export type EquipmentFiltersInput = z.infer<typeof equipmentFiltersSchema>
export type ReportConfigInput = z.infer<typeof reportConfigSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>