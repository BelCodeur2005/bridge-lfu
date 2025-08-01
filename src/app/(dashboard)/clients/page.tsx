// app/(dashboard)/clients/page.tsx
'use client';

import { useState } from 'react';
import { useClients, useDebounce, useSectors } from '@/hooks/index';
import { useAuthPermissions } from '@/hooks/index';
import { ClientsTable } from '@/components/tables/ClientsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Alert } from '@/components/ui/alert';
import Link from 'next/link';
import { RocketIcon, Search, Users, Plus, Filter } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  const { can } = useAuthPermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const { data, isLoading, isError, error } = useClients({
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm,
    sector: selectedSector,
  });

  const { data: sectors, isLoading: isLoadingSectors, isError: isErrorSectors } = useSectors();

  if (isLoading || isLoadingSectors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center space-y-4">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-slate-600 font-medium">Chargement des clients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || isErrorSectors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-2xl mx-auto pt-20">
          <Alert variant="destructive" className="shadow-lg border-red-200">
            <RocketIcon className="h-5 w-5" />
            <div>
              <h3 className="font-bold text-lg">Erreur de chargement</h3>
              <p className="mt-2 text-sm">
                Une erreur est survenue lors du chargement des clients ou des secteurs.
                {error instanceof Error && (
                  <span className="block mt-1 font-mono text-xs bg-red-50 p-2 rounded">
                    {error.message}
                  </span>
                )}
              </p>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  const clients = data?.data || [];
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      <div className="container mx-auto py-8 px-6">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Gestion des Clients
              </h1>
              <p className="text-slate-600 text-lg">
                Gérez votre portefeuille client efficacement
              </p>
            </div>
            {can('create', 'clients') && (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                <Link href="/clients/new">Nouveau client</Link>
              </Button>
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Clients</p>
                    <p className="text-3xl font-bold text-slate-800">{totalItems}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Secteurs</p>
                    <p className="text-3xl font-bold text-slate-800">{sectors?.length || 0}</p>
                  </div>
                  <Filter className="h-12 w-12 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Page Actuelle</p>
                    <p className="text-3xl font-bold text-slate-800">{currentPage}/{totalPages}</p>
                  </div>
                  <Search className="h-12 w-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-700">
              Recherche et Filtres
            </CardTitle>
            <CardDescription>
              Trouvez rapidement le client que vous recherchez
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom de client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              
              <Select 
                onValueChange={(value) => setSelectedSector(value === 'all' ? '' : value)} 
                value={selectedSector || 'all'}
              >
                <SelectTrigger className="w-full sm:w-[220px] bg-white/80 border-slate-200">
                  <Filter className="mr-2 h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Secteur d'activité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  {sectors?.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des clients */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-0">
            <ClientsTable clients={clients} />
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalItems > 10 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600 font-medium">
                  Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, totalItems)} sur {totalItems} clients
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => prev - 1)} 
                        disabled={currentPage === 1}
                        className="hover:bg-blue-50 hover:text-blue-700"
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => prev + 1)} 
                        disabled={currentPage === totalPages}
                        className="hover:bg-blue-50 hover:text-blue-700"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}