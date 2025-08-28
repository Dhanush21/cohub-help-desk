import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateResident, useUpdateResident } from '@/hooks/useResidents'
import { Resident } from '@/lib/supabase'
import { format } from 'date-fns'

const residentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  apartment_number: z.string().min(1, 'Apartment number is required'),
  building: z.string().min(1, 'Building is required'),
  move_in_date: z.string().min(1, 'Move-in date is required'),
  move_out_date: z.string().optional(),
  emergency_contact_name: z.string().min(1, 'Emergency contact name is required'),
  emergency_contact_phone: z.string().min(10, 'Emergency contact phone is required'),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
})

type ResidentFormData = z.infer<typeof residentSchema>

interface ResidentDialogProps {
  open: boolean
  onClose: () => void
  resident?: Resident | null
}

export default function ResidentDialog({ open, onClose, resident }: ResidentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createResident = useCreateResident()
  const updateResident = useUpdateResident()

  const form = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      apartment_number: '',
      building: '',
      move_in_date: '',
      move_out_date: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
      status: 'active',
    },
  })

  // Reset form when dialog opens/closes or resident changes
  useEffect(() => {
    if (resident) {
      form.reset({
        first_name: resident.first_name,
        last_name: resident.last_name,
        email: resident.email,
        phone: resident.phone,
        apartment_number: resident.apartment_number,
        building: resident.building,
        move_in_date: format(new Date(resident.move_in_date), 'yyyy-MM-dd'),
        move_out_date: resident.move_out_date ? format(new Date(resident.move_out_date), 'yyyy-MM-dd') : '',
        emergency_contact_name: resident.emergency_contact_name,
        emergency_contact_phone: resident.emergency_contact_phone,
        notes: resident.notes || '',
        status: resident.status,
      })
    } else {
      form.reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        apartment_number: '',
        building: '',
        move_in_date: '',
        move_out_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: '',
        status: 'active',
      })
    }
  }, [resident, form])

  const onSubmit = async (data: ResidentFormData) => {
    setIsSubmitting(true)
    try {
      const residentData = {
        ...data,
        move_out_date: data.move_out_date || undefined,
        notes: data.notes || undefined,
      }

      if (resident) {
        await updateResident.mutateAsync({
          id: resident.id,
          updates: residentData,
        })
      } else {
        await createResident.mutateAsync(residentData)
      }
      
      onClose()
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {resident ? 'Edit Resident' : 'Add New Resident'}
          </DialogTitle>
          <DialogDescription>
            {resident 
              ? 'Update the resident information below.'
              : 'Fill in the details to add a new resident to the system.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...form.register('first_name')}
                placeholder="John"
              />
              {form.formState.errors.first_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.first_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...form.register('last_name')}
                placeholder="Doe"
              />
              {form.formState.errors.last_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="john.doe@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="+1234567890"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Apartment Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apartment_number">Apartment Number *</Label>
              <Input
                id="apartment_number"
                {...form.register('apartment_number')}
                placeholder="101"
              />
              {form.formState.errors.apartment_number && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.apartment_number.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="building">Building *</Label>
              <Input
                id="building"
                {...form.register('building')}
                placeholder="Building A"
              />
              {form.formState.errors.building && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.building.message}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="move_in_date">Move-in Date *</Label>
              <Input
                id="move_in_date"
                type="date"
                {...form.register('move_in_date')}
              />
              {form.formState.errors.move_in_date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.move_in_date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="move_out_date">Move-out Date</Label>
              <Input
                id="move_out_date"
                type="date"
                {...form.register('move_out_date')}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
              <Input
                id="emergency_contact_name"
                {...form.register('emergency_contact_name')}
                placeholder="Jane Doe"
              />
              {form.formState.errors.emergency_contact_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.emergency_contact_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
              <Input
                id="emergency_contact_phone"
                {...form.register('emergency_contact_phone')}
                placeholder="+1234567891"
              />
              {form.formState.errors.emergency_contact_phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.emergency_contact_phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Status and Notes */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value: 'active' | 'inactive' | 'pending') => 
                form.setValue('status', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-destructive">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Additional notes about the resident..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (resident ? 'Updating...' : 'Creating...') 
                : (resident ? 'Update Resident' : 'Create Resident')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}