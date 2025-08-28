import { useResidents } from '@/hooks/useResidents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Users, Building, AlertCircle, TrendingUp, Plus, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { data: residents, isLoading, error } = useResidents()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load dashboard data'}
          </p>
        </div>
      </div>
    )
  }

  const totalResidents = residents?.length || 0
  const activeResidents = residents?.filter(r => r.status === 'active').length || 0
  const pendingResidents = residents?.filter(r => r.status === 'pending').length || 0
  const inactiveResidents = residents?.filter(r => r.status === 'inactive').length || 0

  const recentResidents = residents?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your residential community management
          </p>
        </div>
        <Link to="/residents">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Resident
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResidents}</div>
            <p className="text-xs text-muted-foreground">
              All registered residents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Residents</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeResidents}</div>
            <p className="text-xs text-muted-foreground">
              Currently living in the building
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingResidents}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting move-in or approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveResidents}</div>
            <p className="text-xs text-muted-foreground">
              Former residents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Residents */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Residents</CardTitle>
                <CardDescription>
                  Latest registered residents
                </CardDescription>
              </div>
              <Link to="/residents">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentResidents.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No residents found</p>
                <Link to="/residents">
                  <Button className="mt-4">Add First Resident</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentResidents.map((resident) => (
                  <div key={resident.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {resident.first_name.charAt(0)}{resident.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {resident.first_name} {resident.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Apt {resident.apartment_number} • {resident.building}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        resident.status === 'active' 
                          ? 'bg-success/10 text-success' 
                          : resident.status === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {resident.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/residents" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Residents
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
                <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  Soon
                </span>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Building className="h-4 w-4 mr-2" />
                Building Settings
                <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  Soon
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}