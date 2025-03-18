'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRoles } from '@/components/users/user-roles'
import { authFetcher } from '@/lib/auth-fetcher'
import { User } from '@/lib/types/response-types'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'


interface UserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setIsVerified(user.isEmailVerified)
    }
  }, [user])

  const handleVerificationChange = async () => {
    if (!user) return

    setIsUpdating(true)
    try {
      await authFetcher.patch('/admin/update-verification', {
        userId: user.id,
        isVerify: !isVerified,
      })

      setIsVerified(!isVerified)
      toast.success(
        `User verification status updated to ${
          !isVerified ? 'verified' : 'unverified'
        }.`
      )
    } catch (error) {
      console.error('Failed to update verification status:', error)
      toast.error('Failed to update verification status.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and manage user information, roles, and permissions.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='details'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='details'>User Details</TabsTrigger>
            <TabsTrigger value='roles'>Roles & Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value='details' className='space-y-4 pt-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Name
                </h4>
                <p className='text-base'>{user.displayName}</p>
              </div>
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Email
                </h4>
                <p className='text-base'>{user.email}</p>
              </div>
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Role
                </h4>
                
                    {user.roles.map((role) => (
                      <Badge
                        className='mr-2'
                        key={role}
                        variant={
                          role === 'admin'
                            ? 'default'
                            : role === 'teacher'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    ))}

              </div>
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Created At
                </h4>
                <p className='text-base'>
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='verification'>Email Verification</Label>
                <p className='text-sm text-muted-foreground'>
                  {`Toggle to verify or unverify this user's email.`}
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                {isUpdating ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Switch
                    id='verification'
                    checked={isVerified}
                    onCheckedChange={handleVerificationChange}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value='roles' className='space-y-4 pt-4'>
            <UserRoles userId={user.id} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
