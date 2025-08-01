import * as React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse' | 'dots';
}

/**
 * Un composant de spinner de chargement moderne avec plusieurs variantes et tailles.
 * @param {object} props - Les propriétés du composant.
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - La taille du spinner.
 * @param {'default' | 'gradient' | 'pulse' | 'dots'} [props.variant='default'] - Le style du spinner.
 * @param {string} [props.className] - Classes CSS additionnelles.
 */
export function Spinner({ 
  size = 'md', 
  variant = 'default',
  className, 
  ...props 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const borderSizes = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-4',
  };

  if (variant === 'dots') {
    const dotSizes = {
      sm: 'h-1 w-1',
      md: 'h-2 w-2',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };

    return (
      <div
        role="status"
        className={cn('flex space-x-1 items-center', className)}
        {...props}
      >
        <div className={cn(
          'bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-bounce',
          dotSizes[size]
        )} style={{ animationDelay: '0ms' }} />
        <div className={cn(
          'bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-bounce',
          dotSizes[size]
        )} style={{ animationDelay: '150ms' }} />
        <div className={cn(
          'bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-bounce',
          dotSizes[size]
        )} style={{ animationDelay: '300ms' }} />
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        role="status"
        className={cn(
          'rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  const variantClasses = {
    default: 'border-slate-300 border-t-blue-600',
    gradient: 'border-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-border',
  };

  if (variant === 'gradient') {
    return (
      <div
        role="status"
        className={cn(
          'animate-spin rounded-full bg-gradient-conic from-blue-500 via-indigo-500 to-purple-500 p-1',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
          <div className={cn(
            'bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20',
            size === 'sm' ? 'h-2 w-2' : 
            size === 'md' ? 'h-4 w-4' : 
            size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'
          )} />
        </div>
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={cn(
        'animate-spin rounded-full border-solid',
        sizeClasses[size],
        borderSizes[size],
        variantClasses[variant] || variantClasses.default,
        'drop-shadow-sm',
        className
      )}
      {...props}
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

// Composant de chargement page complète
export function PageSpinner({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          <Spinner size="xl" variant="gradient" className="mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="md" variant="pulse" className="opacity-40" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-slate-700 font-medium text-lg">{message}</p>
          <div className="flex justify-center">
            <Spinner variant="dots" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant de chargement inline
export function InlineSpinner({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn("flex items-center space-x-3 text-slate-600", className)}>
      <Spinner size="sm" />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}