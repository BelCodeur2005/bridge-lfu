import { cn } from '@/lib/utils'
import React from 'react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  speed?: 'slow' | 'normal' | 'fast'
  thickness?: 'thin' | 'normal' | 'thick'
  className?: string
  label?: string
  showLabel?: boolean
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  speed = 'normal',
  thickness = 'normal',
  className,
  label = 'Chargement...',
  showLabel = false
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const variantClasses = {
    default: 'border-gray-200 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300',
    primary: 'border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400',
    secondary: 'border-gray-200 border-t-gray-500 dark:border-gray-600 dark:border-t-gray-400',
    success: 'border-green-200 border-t-green-600 dark:border-green-800 dark:border-t-green-400',
    warning: 'border-yellow-200 border-t-yellow-600 dark:border-yellow-800 dark:border-t-yellow-400',
    danger: 'border-red-200 border-t-red-600 dark:border-red-800 dark:border-t-red-400'
  }

  const speedClasses = {
    slow: 'animate-spin [animation-duration:2s]',
    normal: 'animate-spin',
    fast: 'animate-spin [animation-duration:0.5s]'
  }

  const thicknessClasses = {
    thin: 'border',
    normal: 'border-2',
    thick: 'border-4'
  }

  const labelSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const SpinnerElement = (
    <div 
      className={cn(
        'rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        speedClasses[speed],
        thicknessClasses[thickness],
        className
      )}
      role="status"
      aria-label={label}
    />
  )

  if (showLabel) {
    return (
      <div className="flex flex-col items-center gap-2">
        {SpinnerElement}
        <span className={cn(
          'text-gray-600 dark:text-gray-400 font-medium',
          labelSizeClasses[size]
        )}>
          {label}
        </span>
      </div>
    )
  }

  return SpinnerElement
}

// Composant wrapper pour les cas d'usage courants
export function LoadingOverlay({ 
  isLoading, 
  children, 
  className,
  spinnerProps 
}: {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  spinnerProps?: Omit<LoadingSpinnerProps, 'showLabel'> & { showLabel?: boolean }
}) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner {...spinnerProps} />
        </div>
      )}
    </div>
  )
}

// Variantes prédéfinies pour des cas d'usage spécifiques
export const SpinnerVariants = {
  Button: (props?: Partial<LoadingSpinnerProps>) => (
    <LoadingSpinner size="sm" variant="primary" {...props} />
  ),
  
  Card: (props?: Partial<LoadingSpinnerProps>) => (
    <LoadingSpinner size="lg" variant="default" showLabel {...props} />
  ),
  
  Page: (props?: Partial<LoadingSpinnerProps>) => (
    <LoadingSpinner size="xl" variant="primary" showLabel speed="normal" {...props} />
  ),
  
  Inline: (props?: Partial<LoadingSpinnerProps>) => (
    <LoadingSpinner size="xs" variant="secondary" {...props} />
  )
}

// Hook personnalisé pour gérer les états de chargement
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)
  
  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)
  const toggleLoading = () => setIsLoading(prev => !prev)
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  }
}

// Exemples d'utilisation :

// Usage basique
// <LoadingSpinner />

// Avec options
// <LoadingSpinner size="lg" variant="primary" speed="fast" showLabel />

// Avec overlay
// <LoadingOverlay isLoading={isLoading}>
//   <div>Votre contenu ici</div>
// </LoadingOverlay>

// Variantes prédéfinies
// <SpinnerVariants.Button />
// <SpinnerVariants.Page label="Chargement de la page..." />