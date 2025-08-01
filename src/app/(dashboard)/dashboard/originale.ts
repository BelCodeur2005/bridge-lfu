'use client'

import { useDashboard, useAuthPermissions, useEquipmentStats, useLicenseStats } from '@/hooks'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Shield, 
  Server, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  DollarSign,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'



interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  trend?: {
    value: number
    isPositive: boolean
  }
  href?: string
  subtitle?: string
}

function StatCard({ title, value, icon: Icon, color, trend, href, subtitle }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  }

  const content = (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-lg border', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

interface AlertItemProps {
  alert: {
    id: string
    item_name: string
    client_name?: string
    type: string
    alert_type: string
    alert_level: string
    alert_date: string
    status: string
  }
}

function AlertItem({ alert }: AlertItemProps) {
  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'license_expiry':
        return Shield
      case 'equipment_obsolescence':
        return Server
      default:
        return AlertTriangle
    }
  }

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'expired':
        return 'destructive'
      case 'urgent':
        return 'destructive'
      case 'warning':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle
      case 'expired':
      case 'obsolete':
        return XCircle
      case 'about_to_expire':
      case 'bientot_obsolete':
        return Clock
      default:
        return AlertTriangle
    }
  }

  const Icon = getAlertIcon(alert.alert_type)
  const StatusIcon = getStatusIcon(alert.status)

  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <div className="p-2 bg-red-50 rounded-lg">
          <Icon className="h-5 w-5 text-red-600" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {alert.item_name}
          </p>
          <Badge variant={getAlertColor(alert.alert_level)}>
            {alert.alert_level}
          </Badge>
        </div>
        <div className="flex items-center mt-1 space-x-2">
          {alert.client_name && (
            <p className="text-sm text-gray-500">
              Client: {alert.client_name}
            </p>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <StatusIcon className="h-4 w-4 mr-1" />
            {alert.status}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(alert.alert_date).toLocaleDateString('fr-FR')}
        </p>
      </div>
      
      <div className="flex-shrink-0">
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { stats, alerts, loading, error } = useDashboard()
  const { stats: equipmentStats, loading: equipmentLoading } = useEquipmentStats()
  const { stats: licenseStats, loading: licenseLoading } = useLicenseStats()
  const permissions = useAuthPermissions()

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement du tableau de bord: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const canViewAllData = permissions.canViewAllData()
console.log('Can view all data:', canViewAllData);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">
          Vue d&apos;ensemble de votre {canViewAllData ? 'plateforme' : 'compte'}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Stats Grid */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {canViewAllData && (
            <StatCard
              title="Total Clients"
              value={stats.total_clients}
              icon={Users}
              color="blue"
              href="/dashboard/clients"
              trend={{ value: 12, isPositive: true }}
            />
          )}
          <StatCard
            title="Licences Actives"
            value={stats.total_licenses - stats.expired_licenses}
            icon={Shield}
            color="green"
            href="/dashboard/licenses"
            subtitle={`${stats.expired_licenses} expirées`}
            trend={{ value: -5, isPositive: false }}
          />
          <StatCard
            title="Équipements Actifs"
            value={stats.total_equipment - stats.obsolete_equipment}
            icon={Server}
            color="blue"
            href="/dashboard/equipment"
            subtitle={`${stats.obsolete_equipment} obsolètes`}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Alertes Critiques"
            value={stats.expired_licenses + stats.obsolete_equipment}
            icon={AlertTriangle}
            color="red"
            subtitle="Nécessitent une action"
            trend={{ value: -15, isPositive: true }}
          />
        </div>
      )}

      {/* Charts Section */}
      {!loading && (canViewAllData || (!licenseLoading && !equipmentLoading)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipment Chart */}
          {equipmentStats && (
            <ChartCard title="Répartition des Équipements par Type">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={equipmentStats.chartData.types}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {/* {equipmentStats.chartData.types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))} */}
                    {equipmentStats.chartData.types.map((_, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}

                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* License Status Chart */}
          {licenseStats && (
            <ChartCard title="Statut des Licences">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={licenseStats.chartData.statuses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Equipment Status Chart */}
          {equipmentStats && (
            <ChartCard title="Statut des Équipements">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={equipmentStats.chartData.statuses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* License Expiry Trend */}
          {licenseStats && licenseStats.chartData.expiry.length > 0 && (
            <ChartCard title="Évolution des Expirations de Licences">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={licenseStats.chartData.expiry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                    name="Expirations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Alertes Récentes
                {alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {alerts.length}
                  </Badge>
                )}
              </CardTitle>
              <Link
                href="/dashboard/notifications"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center"
              >
                Voir tout
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {alerts.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  
                  {alerts
                    .filter((alert: { item_name: unknown }) => alert.item_name) // ← on ignore celles sans item_name
                    .slice(0, 8)
                    .map((alert: { id: string; item_name?: string; client_name?: string | undefined; type?: string; alert_type?: string; alert_level?: string; alert_date?: string; status?: string },index) => (
                      <AlertItem key={`${alert.id}-${index}`} alert={alert as AlertItemProps['alert']} />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Tout va bien !</p>
                  <p>Aucune alerte critique à signaler</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {permissions.can('create', 'clients') && (
                <Link
                  href="/dashboard/clients/new"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-blue-900">
                      Nouveau Client
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              {permissions.can('create', 'licenses') && (
                <Link
                  href="/dashboard/licenses/new"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-900">
                      Nouvelle Licence
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              {permissions.can('create', 'equipment') && (
                <Link
                  href="/dashboard/equipment/new"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-purple-900">
                      Nouvel Équipement
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              {permissions.can('read', 'reports') && (
                <Link
                  href="/dashboard/reports"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="text-sm font-medium text-orange-900">
                      Générer un Rapport
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics for Admins */}
          {canViewAllData && stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Métriques Système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    99.9%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Utilisateurs actifs</span>
                  <Badge variant="secondary">
                    {Math.floor(Math.random() * 50) + 10}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Temps de réponse</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    &lt; 200ms
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats for Clients */}
          {!canViewAllData && stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Mes Données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-blue-900">Licences</span>
                  </div>
                  <Badge variant="secondary">{stats.total_licenses}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-purple-900">Équipements</span>
                  </div>
                  <Badge variant="secondary">{stats.total_equipment}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="text-sm font-medium text-orange-900">Alertes</span>
                  </div>
                  <Badge variant={alerts.length > 0 ? "destructive" : "secondary"}>
                    {alerts.length}
                  </Badge>
                </div>
                {licenseStats && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-green-900">Valeur totale</span>
                    </div>
                    <Badge variant="secondary">
                      {licenseStats.totalValue.toLocaleString()} €
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}