"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/use-user-profile"
import { User, Mail, Edit, Save, Loader2, Palette, Eye, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { formatDateSafe } from "@/lib/utils/date-utils"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState({ artwork_count: 0, total_views: 0 })
  const [statsLoading, setStatsLoading] = useState(false)

  // Fetch user stats from database
  const fetchStats = async () => {
    if (!user?.id) return
    try {
      setStatsLoading(true)
      const response = await fetch(`/api/users/stats?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  // Update form fields when profile data loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name)
      setBio(profile.bio || "")
    } else if (user) {
      setDisplayName(user.display_name || user.email.split('@')[0])
      setBio("")
    }

    if (user?.id) {
      fetchStats()
    }
  }, [profile, user])

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name is required")
      return
    }

    setIsSaving(true)

    const result = await updateProfile(displayName.trim(), bio.trim() || undefined)

    if (result.success) {
      setIsEditing(false)
      // Refresh profile data to get updated timestamps
      await refreshProfile()
    } else {
      toast.error(result.error || "Failed to update profile")
    }

    setIsSaving(false)
  }


  const handleCancel = () => {
    setIsEditing(false)
    // Reset form fields to current profile data
    if (profile) {
      setDisplayName(profile.display_name)
      setBio(profile.bio || "")
    } else if (user) {
      setDisplayName(user.display_name || user.email.split('@')[0])
      setBio("")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center container-padding">
        <Card className="w-full max-w-md glass-strong border-border/50">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="relative mb-6">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Palette className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-medium text-foreground">Curating your profile...</p>
            <p className="text-sm text-muted-foreground mt-2">Personalizing your creative space</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center container-padding">
        <Card className="w-full max-w-md glass-strong border-destructive/20 border">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <User className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Profile Error</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">{profileError}</p>
            <Button onClick={refreshProfile} className="btn-primary w-full h-11">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Profile Header */}
          <Card className="glass-strong border-border/50 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />
            <CardHeader className="text-center pt-12 pb-10">
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    <User className="w-14 h-14 text-primary" />
                  </div>
                  <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-background flex items-center justify-center shadow-lg" title="Active Account" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-4xl font-bold tracking-tight text-foreground">
                  {displayName || user.email.split('@')[0]}
                </CardTitle>
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium"><Mail className="w-4 h-4" /> {user.email}</span>
                  {user.phone_number && (
                    <>
                      <span className="text-border">|</span>
                      <span className="font-medium">{user.phone_number}</span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-strong border-border/50 group hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Your Artworks</p>
                    <p className="text-4xl font-black text-foreground tabular-nums">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin inline text-primary" /> : stats.artwork_count}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Palette className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-strong border-border/50 group hover:border-secondary/30 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Views</p>
                    <p className="text-4xl font-black text-foreground tabular-nums">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin inline text-secondary" /> : stats.total_views.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Eye className="w-8 h-8 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <Card className="glass-strong border-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Profile Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSaving}
                className="glass-strong border-primary/20 text-primary hover:bg-primary/10 transition-all font-bold h-10 px-6 rounded-full group"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isEditing ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                )}
                {isSaving ? "Saving..." : isEditing ? "Save Profile" : "Edit Details"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="pl-10 glass border-0 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-gray-300">
                  Display Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing || isSaving}
                    className={`pl-10 glass border-0 text-white ${!isEditing ? "cursor-not-allowed text-gray-400" : "focus:ring-2 focus:ring-blue-500/50"
                      }`}
                    placeholder="Enter your display name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing || isSaving}
                  className={`glass border-0 text-white min-h-[100px] ${!isEditing ? "cursor-not-allowed text-gray-400" : "focus:ring-2 focus:ring-blue-500/50"
                    }`}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {bio.length}/500 characters
                </p>
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !displayName.trim()}
                    className="btn-primary"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="glass-strong border-0">
            <CardHeader>
              <CardTitle className="text-xl text-white">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 glass rounded">
                <div>
                  <h3 className="font-medium text-white">Account Status</h3>
                  <p className="text-sm text-gray-400">Your account is active and verified</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-4 glass rounded">
                <div>
                  <h3 className="font-medium text-white">Member Since</h3>
                  <p className="text-sm text-gray-400">
                    {formatDateSafe(profile?.created_at, { format: 'medium' })}
                  </p>
                </div>
              </div>

              {profile?.updated_at && profile.updated_at !== profile.created_at && (
                <div className="flex items-center justify-between p-4 glass rounded">
                  <div>
                    <h3 className="font-medium text-white">Last Updated</h3>
                    <p className="text-sm text-gray-400">
                      {formatDateSafe(profile.updated_at, { format: 'medium' })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}