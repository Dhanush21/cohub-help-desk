import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { residentService, Resident } from '@/lib/supabase'
import { toast } from 'sonner'

export function useResidents() {
  return useQuery({
    queryKey: ['residents'],
    queryFn: residentService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useResident(id: string) {
  return useQuery({
    queryKey: ['resident', id],
    queryFn: () => residentService.getById(id),
    enabled: !!id,
  })
}

export function useSearchResidents(query: string) {
  return useQuery({
    queryKey: ['residents', 'search', query],
    queryFn: () => residentService.search(query),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resident: Omit<Resident, 'id' | 'created_at' | 'updated_at'>) =>
      residentService.create(resident),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Resident created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create resident: ${error.message}`)
    },
  })
}

export function useUpdateResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Resident> }) =>
      residentService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['residents'] })
      queryClient.invalidateQueries({ queryKey: ['resident', data.id] })
      toast.success('Resident updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update resident: ${error.message}`)
    },
  })
}

export function useDeleteResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => residentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Resident deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete resident: ${error.message}`)
    },
  })
}