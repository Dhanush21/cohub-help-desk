import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface Resident {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  apartment_number: string
  building: string
  move_in_date: string
  move_out_date?: string
  emergency_contact_name: string
  emergency_contact_phone: string
  notes?: string
  status: 'active' | 'inactive' | 'pending'
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
  updated_at: string
  role: 'admin' | 'super_admin'
  full_name: string
}

// Database helper functions
export const residentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Resident[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Resident
  },

  async create(resident: Omit<Resident, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('residents')
      .insert([resident])
      .select()
      .single()
    
    if (error) throw error
    return data as Resident
  },

  async update(id: string, updates: Partial<Resident>) {
    const { data, error } = await supabase
      .from('residents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Resident
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,apartment_number.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Resident[]
  }
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getAdminProfile(userId: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data as AdminUser
  }
}