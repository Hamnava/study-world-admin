import type { Metadata } from "next"
import { UserManagement } from "@/components/users/user-management"

export const metadata: Metadata = {
  title: "User Management - StudyWorld Admin",
  description: "Manage users in the StudyWorld platform",
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">View and manage all users in the system</p>
      </div>
      <UserManagement />
    </div>
  )
}

