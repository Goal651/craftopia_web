import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

interface UserProfile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (fetchError) {
          // If profile doesn't exist, create a default one
          if (fetchError.code === 'PGRST116') {
            const { data: newProfile, error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: user.id,
                display_name: user.user_metadata?.display_name || user.email.split('@')[0],
                bio: null
              })
              .select()
              .single()

            if (insertError) {
              setError(insertError.message)
            } else {
              setProfile(newProfile)
            }
          } else {
            setError(fetchError.message)
          }
        } else {
          setProfile(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, supabase])

  const refreshProfile = async () => {
    if (!user) return

    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setProfile(data)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh profile')
    }
  }

  return {
    profile,
    loading,
    error,
    refreshProfile
  }
}