import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { AuthService, type ChangePasswordRequest } from '@/services/authService'
import { Lock, Save } from 'lucide-react'

export const Settings: React.FC = () => {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const validate = (): string | null => {
    if (!currentPassword.trim()) return 'Current password is required'
    if (!newPassword.trim()) return 'New password is required'
    if (newPassword.length < 8) return 'New password must be at least 8 characters'
    if (newPassword === currentPassword) return 'New password must be different from current password'
    if (newPassword !== confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      toast({ title: 'Validation error', description: err, variant: 'error' })
      return
    }
    setSubmitting(true)
    try {
      const payload: ChangePasswordRequest = {
        current_password: currentPassword,
        new_password: newPassword,
      }
      const res = await AuthService.changePassword(payload)
      if (res.success && res.data) {
        toast({ title: 'Success', description: res.data.message || 'Password changed successfully', variant: 'success' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const msg = res.error?.message || 'Failed to change password'
        toast({ title: 'Error', description: msg, variant: 'error' })
      }
    } catch (_) {
      toast({ title: 'Error', description: 'Unexpected error. Please try again.', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                disabled={submitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={submitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={submitting}
                required
              />
            </div>
            <div>
              <Button type="submit" disabled={submitting}>
                <Save className={`h-4 w-4 mr-2 ${submitting ? 'animate-pulse' : ''}`} />
                {submitting ? 'Saving...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


