import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, authService, AdminUser } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  adminProfile: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const profile = await authService.getAdminProfile(session.user.id)
            setAdminProfile(profile)
          } catch (error) {
            console.error('Error fetching admin profile:', error)
            // If user doesn't have admin profile, sign them out
            await authService.signOut()
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const profile = await authService.getAdminProfile(session.user.id)
            setAdminProfile(profile)
          } catch (error) {
            console.error('Error fetching admin profile:', error)
            setAdminProfile(null)
          }
        } else {
          setAdminProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { user: signedInUser } = await authService.signIn(email, password)
      
      if (signedInUser) {
        // Verify user has admin profile
        const profile = await authService.getAdminProfile(signedInUser.id)
        if (!profile) {
          await authService.signOut()
          throw new Error('Access denied. Admin privileges required.')
        }
      }
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    await authService.signOut()
  }

  const value = {
    user,
    adminProfile,
    loading,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}