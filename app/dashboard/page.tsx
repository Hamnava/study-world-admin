import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/stats"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dashboard - StudyWorld Admin",
  description: "StudyWorld Admin Dashboard",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the StudyWorld Admin Dashboard</p>
      </div>
      <DashboardStats />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
        <Link href={"/dashboard/users"}>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users, roles, and permissions</CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <p>View and manage all users in the system.</p>
          </CardContent>
          </Link>
        </Card>
        <Card>
          <Link href={"/dashboard/roles"}>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Create and manage roles with specific permissions</CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <p>Define roles and assign permissions to them.</p>
          </CardContent>
          </Link>
        </Card>
        <Card>
          <Link href={"/dashboard/permissions"}>
          <CardHeader>
            <CardTitle>Permissions Management</CardTitle>
            <CardDescription>View and assign permissions to roles</CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <p>Manage permissions across the platform.</p>
          </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}

