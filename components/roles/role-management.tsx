"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleDialog } from "@/components/roles/role-dialog"
import { Loader2, Plus, Settings } from "lucide-react"
import { authFetcher } from "@/lib/auth-fetcher"
import { Role } from "../users/user-roles"


export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setIsLoading(true)
    try {
      const response = await authFetcher.get<Role[]>("/admin/all-roles")
      if (response.data) {
        setRoles(response.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setIsDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setIsDialogOpen(true)
  }

  const handleRoleChange = () => {
    fetchRoles()
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {role.name}
                 
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Edit {role.name} role</span>
                </Button>
              </CardHeader>
              <CardContent>
                <CardDescription>{role.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleEditRole(role)}>
                  Manage Permissions
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <RoleDialog
        role={selectedRole}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRoleChange={handleRoleChange}
      />
    </div>
  )
}

