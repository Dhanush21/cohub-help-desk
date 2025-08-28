import { useState } from 'react'
import { useResidents, useSearchResidents } from '@/hooks/useResidents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import ResidentDialog from '@/components/ResidentDialog'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle,
  Users,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { Resident } from '@/lib/supabase'

export default function ResidentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingResident, setEditingResident] = useState<Resident | null>(null)

  const { data: allResidents, isLoading: isLoadingAll, error } = useResidents()
  const { data: searchResults, isLoading: isSearching } = useSearchResidents(searchQuery)

  const residents = searchQuery ? searchResults : allResidents
  const isLoading = searchQuery ? isSearching : isLoadingAll

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Residents</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load residents data'}
          </p>
        </div>
      </div>
    )
  }

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident)
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingResident(null)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-success/10 text-success hover:bg-success/20',
      pending: 'bg-warning/10 text-warning hover:bg-warning/20',
      inactive: 'bg-muted text-muted-foreground hover:bg-muted/80'
    }
    return variants[status as keyof typeof variants] || variants.inactive
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Residents</h1>
          <p className="text-muted-foreground">
            Manage all residents in your community
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
              <CardDescription>
                Find residents by name, email, or apartment number
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search residents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Residents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Residents</CardTitle>
              <CardDescription>
                {residents?.length || 0} residents found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="md" />
            </div>
          ) : residents?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No residents found' : 'No residents yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first resident'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Resident
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Apartment</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Move-in Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents?.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {resident.first_name.charAt(0)}{resident.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            {resident.first_name} {resident.last_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{resident.email}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">#{resident.apartment_number}</div>
                          <div className="text-sm text-muted-foreground">{resident.building}</div>
                        </div>
                      </TableCell>
                      <TableCell>{resident.phone}</TableCell>
                      <TableCell>
                        {format(new Date(resident.move_in_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(resident.status)}>
                          {resident.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(resident)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ResidentDialog
        open={isCreateDialogOpen || !!editingResident}
        onClose={handleCloseDialog}
        resident={editingResident}
      />
    </div>
  )
}