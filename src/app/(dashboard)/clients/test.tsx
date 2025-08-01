'use client'

import { useState, useCallback } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { PaginationWithLogic } from '@/components/ui/pagination'
import { useDebounce, usePagination, useAuthPermissions } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import type { Client } from '@/types'

interface ClientsTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onView: (client: Client) => void
}

function ClientsTable({ clients, onEdit, onDelete, onView }: ClientsTableProps) {
  const permissions = useAuthPermissions()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Secteur</TableHead>
            <TableHead>Ville</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="text-gray-500">
                  <p>Aucun client trouvé</p>
                  <p className="text-sm mt-1">Ajoutez votre premier client pour commencer</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{client.name}</div>
                    {client.contact_person && (
                      <div className="text-sm text-gray-500">{client.contact_person}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {client.contact_email && (
                      <div className="text-sm">{client.contact_email}</div>
                    )}
                    {client.contact_phone && (
                      <div className="text-sm text-gray-500">{client.contact_phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {client.sector && (
                    <Badge variant="secondary">{client.sector}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    {client.city && <div>{client.city}</div>}
                    {client.postal_code && (
                      <div className="text-sm text-gray-500">{client.postal_code}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {client.created_at && new Date(client.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(client)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      {permissions.can('update', 'clients') && (
                        <DropdownMenuItem onClick={() => onEdit(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      {permissions.can('delete', 'clients') && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(client)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const { page, limit, goToPage } = usePagination()
  const permissions = useAuthPermissions()
  const supabase = createClient()

  // Fonction pour récupérer les clients
  const fetchClients = useCallback(async () => {
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })

    // Filtres de recherche
    if (debouncedSearch) {
      query = query.ilike('name', `%${debouncedSearch}%`)
    }

    if (selectedSector) {
      query = query.eq('sector', selectedSector)
    }

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Erreur lors du chargement des clients: ${error.message}`)
    }

    return {
      clients: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }, [supabase, debouncedSearch, selectedSector, page, limit])

  // Query React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['clients', debouncedSearch, selectedSector, page, limit],
    queryFn: fetchClients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleEdit = (client: Client) => {
    // TODO: Ouvrir modal d'édition
    console.log('Éditer client:', client)
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.name}" ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id)

      if (error) throw error

      // Rafraîchir la liste
      refetch()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du client')
    }
  }

  const handleView = (client: Client) => {
    // TODO: Ouvrir modal de détails
    console.log('Voir client:', client)
  }

  const handleCreateClient = () => {
    // TODO: Ouvrir modal de création
    console.log('Créer nouveau client')
  }

  if (error) {
    return (
      <div className="container mx-auto px-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
          <p className="text-red-600 text-sm mt-1">{(error as Error).message}</p>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos clients et leurs informations
          </p>
        </div>
        {permissions.can('create', 'clients') && (
          <Button onClick={handleCreateClient}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les secteurs</option>
            <option value="Informatique">Informatique</option>
            <option value="Santé">Santé</option>
            <option value="Education">Éducation</option>
            <option value="Finance">Finance</option>
            <option value="Commerce">Commerce</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">
            {data?.totalCount || 0}
          </div>
          <div className="text-sm text-gray-600">Total clients</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">85%</div>
          <div className="text-sm text-gray-600">Clients actifs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-600">Nouveaux ce mois</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">3</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ClientsTable
            clients={data?.clients || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="border-t p-4">
            <PaginationWithLogic
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}