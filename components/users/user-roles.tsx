'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authFetcher } from '@/lib/auth-fetcher'
import { Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'



interface UserRolesProps {
  userId: number
}

export type Role = {
  id: number;
  name: string;
  description: string;
};

type UserData = {
  userId: number;
  roles: Role[];
};

export function UserRoles({ userId }: UserRolesProps) {
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchUserRoles()
    fetchAllRoles()
  }, [userId])

  const fetchUserRoles = async () => {
    setIsLoading(true)
    try {
      const response = await authFetcher.get<UserData>(`/admin/get-user-roles/${userId}`)
      if (response.data) {
        setUserRoles(response.data.roles)
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error)
      // Set demo data for preview
      setUserRoles([
        {
          id: 1,
          name: 'admin',
          description: 'Administrator role with full access',
          // isDefault: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllRoles = async () => {
    try {
      const response = await authFetcher.get<Role[]>('/admin/all-roles')
      if (response.data) {
        setAvailableRoles(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch all roles:', error)
    }
  }

  const handleAssignRole = async () => {
    if (!selectedRoleId) return

    setIsUpdating(true)
    try {
      await authFetcher.post('/admin/assign-role', {
        userId,
        roleId: Number.parseInt(selectedRoleId),
      })

      // Refresh user roles
      fetchUserRoles()
      setSelectedRoleId('')

      toast.success('Role assigned successfully.')
    } catch (error) {
      console.error('Failed to assign role:', error)
      toast.error('Failed to assign role.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveRole = async (roleId: number) => {
    setIsUpdating(true)
    try {
      await authFetcher.post('/admin/remove-role', {
        userId,
        roleId,
      })

      // Refresh user roles
      fetchUserRoles()

      toast.success('Role removed successfully.')
    } catch (error) {
      console.error('Failed to remove role:', error)
      toast.error('Failed to remove role.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Filter out roles that the user already has
  const filteredAvailableRoles = availableRoles.filter(
    (role) => !userRoles.some((userRole) => userRole.id === role.id)
  )

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Roles</CardTitle>
          <CardDescription>
            Roles currently assigned to this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-4'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          ) : userRoles.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No roles assigned.</p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {userRoles.map((role) => (
                <Badge
                  key={role.id}
                  variant='secondary'
                  className='flex items-center gap-1 px-3 py-1'
                >
                  {role.name}
                  {(
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-4 w-4 rounded-full'
                      onClick={() => handleRemoveRole(role.id)}
                      disabled={isUpdating}
                    >
                      <X className='h-3 w-3' />
                      <span className='sr-only'>Remove {role.name} role</span>
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className='flex items-end gap-2'>
        <div className='flex-1'>
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger>
              <SelectValue placeholder='Select a role to assign' />
            </SelectTrigger>
            <SelectContent>
              {filteredAvailableRoles.length === 0 ? (
                <SelectItem value='none' disabled>
                  No available roles to assign
                </SelectItem>
              ) : (
                filteredAvailableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name} - {role.description}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAssignRole}
          disabled={!selectedRoleId || isUpdating}
        >
          {isUpdating ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Plus className='mr-2 h-4 w-4' />
          )}
          Assign Role
        </Button>
      </div>
    </div>
  )
}
