'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { authFetcher } from '@/lib/auth-fetcher'
import { Permission, RolePermission, RolePermissionsProps } from '@/lib/types/response-types'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'




export function RolePermissions({ roleId }: RolePermissionsProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      await fetchPermissions()
      await fetchRolePermissions()
    }
  
    fetchData()
  }, [roleId])

  const fetchPermissions = async () => {
    try {
      const response = await authFetcher.get<Permission[]>('/admin/all-permissions')
      if (response.data) {
        setPermissions(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  const fetchRolePermissions = async () => {
    setIsLoading(true)
    try {
      const response = await authFetcher.get<RolePermission>(
        `/admin/get-role-permissions/${roleId}`
      )
      if (response.data) {
        setRolePermissions(response.data.permissions.map((p: Permission) => p.id) || [])
      }
    } catch (error) {
      console.error('Failed to fetch role permissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionChange = async (
    permissionId: number,
    checked: boolean
  ) => {
    setIsUpdating(true)
    try {
      if (checked) {
        await authFetcher.post('/admin/assign-permission', {
          roleId,
          permissionId,
        })

        setRolePermissions((prev) => [...prev, permissionId])

        toast.success('Permission assigned successfully.')
      } else {
        await authFetcher.post('/admin/remove-permission', {
          roleId,
          permissionId,
        })

        setRolePermissions((prev) => prev.filter((id) => id !== permissionId))

        toast.success('Permission removed successfully.')
      }
    } catch (error) {
      console.error('Failed to update permission:', error)
      toast.error('Failed to update permission.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Group permissions by category (based on prefix before :)
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.name.split(':')[0]
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className='space-y-4'>
      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <ScrollArea className='h-[400px] pr-4'>
          <div className='space-y-4'>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className='capitalize'>{category}</CardTitle>
                  <CardDescription>
                    Permissions related to {category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {perms.map((permission) => (
                      <div
                        key={permission.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={rolePermissions.includes(permission.id)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              permission.id,
                              checked as boolean
                            )
                          }
                          disabled={isUpdating}
                        />
                        <label
                          htmlFor={`permission-${permission.id}`}
                          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          {permission.description}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
