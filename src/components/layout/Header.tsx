'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  if (!isOpen) return null

  const notifications = [
    {
      id: 1,
      title: 'Licence expirée',
      message: 'Microsoft Office 365 - Client ABC',
      time: '2 minutes',
      unread: true
    },
    {
      id: 2,
      title: 'Équipement obsolète',
      message: 'Serveur HP - Client XYZ',
      time: '1 heure',
      unread: true
    },
    {
      id: 3,
      title: 'Nouveau client',
      message: 'Entreprise DEF a été ajoutée',
      time: '3 heures',
      unread: false
    }
  ]

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
      <div className="py-1">
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0',
                notification.unread && 'bg-blue-50'
              )}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Il y a {notification.time}
                  </p>
                </div>
                {notification.unread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            Voir toutes les notifications
          </button>
        </div>
      </div>
    </div>
  )
}

interface UserDropdownProps {
  isOpen: boolean
  onClose: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
  onSignOut: () => void
}

function UserDropdown({ isOpen, onClose, user, onSignOut }: UserDropdownProps) {
  if (!isOpen) return null

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
      <div className="py-1">
        <div className="px-4 py-2 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        
        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <User className="h-4 w-4 mr-3" />
          Mon profil
        </button>
        
        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <Settings className="h-4 w-4 mr-3" />
          Paramètres
        </button>
        
        <div className="border-t border-gray-200">
          <button
            onClick={onSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'Administrateur',
      technicien: 'Technicien',
      client: 'Client',
      unverified: 'Non vérifié'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const unreadNotifications = 2 // This would come from your notifications hook

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Search */}
          <div className="flex-1 flex items-center">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Rechercher
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Rechercher..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="ml-4 flex items-center md:ml-6 space-x-4">
            {/* User info */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role && getRoleDisplayName(user.role)}
                </p>
              </div>
            </div>

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 text-gray-400 hover:text-gray-500 relative"
              >
                <Bell className="h-6 w-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={notificationOpen}
                onClose={() => setNotificationOpen(false)}
              />
            </div>

            {/* User dropdown */}
            <div ref={userDropdownRef} className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
              </button>
              <UserDropdown
                isOpen={userDropdownOpen}
                onClose={() => setUserDropdownOpen(false)}
                user={user}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}