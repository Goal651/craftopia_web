"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export function useUserProfile() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const response = await fetch(`/api/users/profile?userId=${user.id}`)
            if (!response.ok) {
                throw new Error("Failed to fetch profile")
            }
            const data = await response.json()
            setProfile(data)
        } catch (err) {
            console.error("Error fetching profile:", err)
            setError(err instanceof Error ? err.message : "Failed to load profile")
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const refreshProfile = async () => {
        await fetchProfile()
    }

    return {
        profile,
        loading,
        error,
        refreshProfile
    }
}
