"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/use-user-profile"
import { User, Mail, Edit, Save, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Update form fields when profile data loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name)
      setBio(profile.bio || "")
    } else if (user) {
      setDisplayName(user.display_name || user.email.split('@')[0])
      setBio("")
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-red-400 mb-4">Error loading profile: {profileError}</p>
            <Button onClick={refreshProfile} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Profile Header */}
          <Card className="glass-strong border-0">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 gradient-blue rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">
                {displayName || user.email}
              </CardTitle>
              <p className="text-gray-400">{user.email}</p>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <Card className="glass-strong border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-white">Profile Information</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSaving}
                className="text-blue-400 hover:text-blue-300"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isEditing ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <Edit className="w-4 h-4 mr-2" />
                )}
                {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <div className="flex items-center justify-between p-4 glass rounded-lg">
                <div>
                  <h3 className="font-medium text-white">Account Status</h3>
                  <p className="text-sm text-gray-400">Your account is active and verified</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-4 glass rounded-lg">
                <div>
                  <h3 className="font-medium text-white">Member Since</h3>
                  <p className="text-sm text-gray-400">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : new Date().toLocaleDateString()
                    }
                  </p>
                </div>
              </div>

              {profile?.updated_at && profile.updated_at !== profile.created_at && (
                <div className="flex items-center justify-between p-4 glass rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Last Updated</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(profile.updated_at).toLocaleDateString()}
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