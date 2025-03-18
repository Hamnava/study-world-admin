"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShieldCheck, Lock } from "lucide-react"
import { authFetcher } from "@/lib/auth-fetcher"
import { Role } from "../users/user-roles"
import { UserApiResponse } from "../users/user-management"
import { Permission, StatsData } from "@/lib/types/response-types"



export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // This would be replaced with actual API endpoints
        const [usersRes, rolesRes, permissionsRes] = await Promise.all([
          authFetcher.get<UserApiResponse>("/admin/get-users?limit=1"),
          authFetcher.get<Role[]>("/admin/all-roles"),
          authFetcher.get<Permission[]>("/admin/all-permissions"),
        ])

        setStats({
          totalUsers: usersRes?.metaData?.count || 0,
          totalRoles: rolesRes.data?.length || 0,
          totalPermissions: permissionsRes.data?.length || 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Set some demo data for preview
        setStats({
          totalUsers: 156,
          totalRoles: 5,
          totalPermissions: 24,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Registered users in the system</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalRoles}</div>
          <p className="text-xs text-muted-foreground">Defined roles in the system</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalPermissions}</div>
          <p className="text-xs text-muted-foreground">Available permissions in the system</p>
        </CardContent>
      </Card>
    </div>
  )
}

