'use client'

import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Mail, Phone, MapPin, Building2 } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useAuthPermissions } from '@/hooks'
import type { Client } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteClient } from '@/lib/supabase/client'

interface ClientsTableProps {
  clients: Client[] | undefined
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const { can } = useAuthPermissions()
  const queryClient = useQueryClient()

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => deleteClient(clientId),
    onSuccess: () => {
      toast.success("Le client a été supprimé avec succès.")
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: (error) => {
      toast.error("Une erreur est survenue lors de la suppression du client.")
    },
  })

  const handleDelete = (clientId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      deleteClientMutation.mutate(clientId)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getSectorColor = (sector: string) => {
    const colors = {
      'Technologie': 'bg-blue-100 text-blue-800 border-blue-200',
      'Finance': 'bg-green-100 text-green-800 border-green-200',
      'Santé': 'bg-red-100 text-red-800 border-red-200',
      'Éducation': 'bg-purple-100 text-purple-800 border-purple-200',
      'Commerce': 'bg-orange-100 text-orange-800 border-orange-200',
      'default': 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return colors[sector as keyof typeof colors] || colors.default
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Building2 className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun client trouvé</h3>
        <p className="text-slate-500 mb-6">
          Commencez par ajouter votre premier client pour voir apparaître vos données ici.
        </p>
        {can('create', 'clients') && (
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            <Link href="/clients/new">Ajouter un client</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 py-4">Client</TableHead>
            <TableHead className="font-semibold text-slate-700">Contact</TableHead>
            <TableHead className="font-semibold text-slate-700">Secteur</TableHead>
            <TableHead className="font-semibold text-slate-700">Localisation</TableHead>
            <TableHead className="font-semibold text-slate-700">Création</TableHead>
            {can('update', 'clients') && (
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, index) => (
            <TableRow 
              key={client.id} 
              className={`
                hover:bg-slate-50/50 transition-colors duration-200 border-b border-slate-100
                ${index % 2 === 0 ? 'bg-white/50' : 'bg-slate-25/30'}
              `}
            >
              <TableCell className="py-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 border-2 border-white shadow-sm rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(client.name)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-base">{client.name}</div>
                    {client.contact_person && (
                      <div className="text-sm text-slate-500 flex items-center">
                        <span className="w-1 h-1 bg-slate-400 rounded-full mr-2"></span>
                        {client.contact_person}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-2">
                  {client.contact_email && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="mr-2 h-3 w-3 text-slate-400" />
                      <span className="truncate max-w-[180px]">{client.contact_email}</span>
                    </div>
                  )}
                  {client.contact_phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="mr-2 h-3 w-3 text-slate-400" />
                      {client.contact_phone}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {client.sector && (
                  <Badge 
                    variant="outline" 
                    className={`${getSectorColor(client.sector)} font-medium px-3 py-1`}
                  >
                    {client.sector}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {client.city && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="mr-2 h-3 w-3 text-slate-400" />
                      {client.city}
                    </div>
                  )}
                  {client.postal_code && (
                    <div className="text-xs text-slate-500 ml-5">
                      {client.postal_code}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-slate-600">
                  {client.created_at && new Date(client.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </TableCell>
              
              {can('update', 'clients') && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-slate-100 data-[state=open]:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ouvrir le menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm shadow-xl border-slate-200">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/clients/${client.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Voir détails</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      {can('update', 'clients') && (
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href={`/clients/${client.id}/edit`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4 text-amber-500" />
                            <span>Modifier</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {can('delete', 'clients') && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}