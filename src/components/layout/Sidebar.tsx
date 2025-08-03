'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuthPermissions } from '@/hooks'
import {
  LayoutDashboard,
  Users,
  Shield,
  Server,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
    permissions: { resource: 'dashboard', action: 'read' }
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
    // permissions: { resource: 'clients', action: 'read' }
  },
  {
    name: 'Licences',
    href: '/licenses',
    icon: Shield,
    // permissions: { resource: 'licenses', action: 'read' }
  },
  {
    name: 'Équipements',
    href: '/equipment',
    icon: Server,
    // permissions: { resource: 'equipment', action: 'read' }
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    permissions: { resource: 'notifications', action: 'read' }
  },
  {
    name: 'Rapports',
    href: '/reports',
    icon: FileText,
    permissions: { resource: 'reports', action: 'read' }
  },
]

const bottomNavItems = [
  {
    name: 'Aide',
    href: '/dashboard/help',
    icon: HelpCircle,
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const permissions = useAuthPermissions()

//   const isActiveRoute = (href: string) => {
//     if (href === '/dashboard') {
//       return pathname === href
//     }
//     return pathname.startsWith(href)
//   }
const isActiveRoute = (href: string) => {
  if (href === '/dashboard') return pathname === href
  return pathname.startsWith(href)
}

    // const isActiveRoute = (href: string) => {
    // if (href === '/dashboard') {
    //     return pathname === '/dashboard' || pathname === '/dashboard/'
    // }
    // return pathname.startsWith(href)
    // }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canAccessRoute = (item: any) => {
    if (!item.permissions) return true
    return permissions.can(item.permissions.action, item.permissions.resource)
  }

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-gray-900">Bridge LFU</span>
          </Link>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems
          .filter(canAccessRoute)
          .map((item) => {
            const Icon = item.icon
            const active = isActiveRoute(item.href)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn(
                  'flex-shrink-0 h-5 w-5',
                  active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                  collapsed ? 'mx-auto' : 'mr-3'
                )} />
                {!collapsed && item.name}
              </Link>
            )
          })}
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const active = isActiveRoute(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn(
                'flex-shrink-0 h-5 w-5',
                active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                collapsed ? 'mx-auto' : 'mr-3'
              )} />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}