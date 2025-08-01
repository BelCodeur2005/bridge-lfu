import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X,XCircle } from 'lucide-react'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'destructive'
  closable?: boolean
  onClose?: () => void
}

export function Alert({ className, variant = 'default', closable, onClose, children, ...props }: AlertProps) {
  const variants = {
    default: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info
    },
    destructive: {
        container:"border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        icon: XCircle,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircle
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: AlertTriangle
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: AlertCircle
    }
  }

  const { container, icon: Icon } = variants[variant]

  return (
    <div
      className={cn('rounded-md border p-4', container, className)}
      {...props}
    >
      <div className="flex">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="ml-3 flex-1">
          {children}
        </div>
        {closable && onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  )
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn('mt-2 text-sm', className)}
      {...props}
    />
  )
}