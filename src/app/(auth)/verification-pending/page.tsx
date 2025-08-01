'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Shield, CheckCircle, Mail, Phone } from 'lucide-react'
import { useAuth } from '@/hooks'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function VerificationPendingPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (user.role !== 'unverified') {
        router.push('/dashboard')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || user.role !== 'unverified') {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-400 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Icon */}
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>

          {/* Content */}
          <div className="mt-6 text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Compte en attente de validation
            </h1>
            
            <p className="text-gray-600">
              Bonjour <span className="font-medium">{user.first_name} {user.last_name}</span>,
            </p>
            
            <p className="text-gray-600">
              Votre compte a été créé avec succès mais nécessite une validation par un administrateur avant que vous puissiez accéder à la plateforme.
            </p>
          </div>

          {/* Status steps */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-sm text-gray-700">
                Compte créé avec succès
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 border-2 border-yellow-500 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                En attente de validation administrateur
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-400">
                Accès complet à la plateforme
              </div>
            </div>
          </div>

          {/* Information box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <Shield className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Pourquoi cette étape ?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Pour garantir la sécurité de nos données et de nos clients, tous les nouveaux comptes sont vérifiés manuellement par notre équipe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Besoin d&apos;aide ?
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <a href="tel:+237123456789" className="hover:text-blue-600">
                  +237 123 456 789
                </a>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Vérifier le statut
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Se déconnecter
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Vous recevrez un email de confirmation une fois votre compte validé.
            </p>
          </div>
        </div>

        {/* Bottom link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}