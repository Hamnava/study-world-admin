'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { authFetcher } from '@/lib/auth-fetcher'
import { Permission, Role, RolePermission } from '@/lib/types/response-types'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'



export function PermissionManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [rolePermissions, setRolePermissions] = useState<
    Record<number, number[]>
  >({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch all permissions
      const permissionsRes = await authFetcher.get<Permission[]>('/admin/all-permissions')
      const fetchedPermissions = permissionsRes.data || []

      // Fetch all roles
      const rolesRes = await authFetcher.get<Role[]>('/admin/all-roles')
      const fetchedRoles = rolesRes.data || []

      // Fetch permissions for each role
      const permissionsByRole: Record<number, number[]> = {}

      await Promise.all(
        fetchedRoles.map(async (role: Role) => {
          try {
            const response = await authFetcher.get<RolePermission>(
              `/admin/get-role-permissions/${role.id}`
            )
            permissionsByRole[role.id] =
              response.data?.permissions.map((p: Permission) => p.id) || []
          } catch (error) {
            console.error(
              `Failed to fetch permissions for role ${role.id}:`,
              error
            )
            permissionsByRole[role.id] = []
          }
        })
      )

      setPermissions(fetchedPermissions)
      setRoles(fetchedRoles)
      setRolePermissions(permissionsByRole)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Set demo data for preview
      const demoPermissions: Permission[] = [
        {
          id: 1,
          name: 'users:read',
          description: 'View users',
          action:'action name',
          group:'group name'
        },
        {
          id: 2,
          name: 'users:write',
          description: 'Create and update users',
           action:'action name',
          group:'group name'
        },
        {
          id: 3,
          name: 'users:delete',
          description: 'Delete users',
           action:'action name',
          group:'group name'
        },
        {
          id: 4,
          name: 'roles:read',
          description: 'View roles',
           action:'action name',
          group:'group name'
        },
        {
          id: 5,
          name: 'roles:write',
          description: 'Create and update roles',
           action:'action name',
          group:'group name'
        },
        {
          id: 6,
          name: 'roles:delete',
          description: 'Delete roles',
           action:'action name',
          group:'group name'
        },
        {
          id: 7,
          name: 'permissions:read',
          description: 'View permissions',
           action:'action name',
          group:'group name'
        },
        {
          id: 8,
          name: 'permissions:write',
          description: 'Assign permissions',
           action:'action name',
          group:'group name'
        },
      ]

      const demoRoles : Role[] = [
        {
          id: 1,
          name: 'admin',
          description: 'Administrator role with full access',
        },
        {
          id: 2,
          name: 'teacher',
          description: 'Teacher role with limited access',
        },
        {
          id: 3,
          name: 'student',
          description: 'Student role with basic access',
        },
      ]

      const demoRolePermissions = {
        1: [1, 2, 3, 4, 5, 6, 7, 8], // Admin has all permissions
        2: [1, 4, 7], // Teacher has read permissions
        3: [1], // Student has only user read permission
      }

      setPermissions(demoPermissions)
      setRoles(demoRoles)
      setRolePermissions(demoRolePermissions)
    } finally {
      setIsLoading(false)
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
    <div className='space-y-6'>
      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Overview of permissions assigned to each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[250px]'>Permission</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className='text-center'>
                        {role.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className='font-medium'>
                        {permission.description}
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell key={role.id} className='text-center'>
                          {rolePermissions[role.id]?.includes(permission.id) ? (
                            <Badge className='mx-auto'>✓</Badge>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className='capitalize'>
                  {category} Permissions
                </CardTitle>
                <CardDescription>
                  Permissions related to {category} functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perms.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className='font-medium'>
                          {permission.name}
                        </TableCell>
                        <TableCell>{permission.description}</TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            {roles
                              .filter((role) =>
                                rolePermissions[role.id]?.includes(
                                  permission.id
                                )
                              )
                              .map((role) => (
                                <Badge key={role.id} variant='outline'>
                                  {role.name}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
