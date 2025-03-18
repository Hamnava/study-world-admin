import type { Metadata } from "next"
import { RoleManagement } from "@/components/roles/role-management"

export const metadata: Metadata = {
  title: "Role Management - StudyWorld Admin",
  description: "Manage roles in the StudyWorld platform",
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">Create and manage roles with specific permissions</p>
      </div>
      <RoleManagement />
    </div>
  )
}

