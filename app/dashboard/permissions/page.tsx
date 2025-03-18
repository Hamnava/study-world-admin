import type { Metadata } from "next"
import { PermissionManagement } from "@/components/permissions/permission-management"

export const metadata: Metadata = {
  title: "Permission Management - StudyWorld Admin",
  description: "Manage permissions in the StudyWorld platform",
}

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
        <p className="text-muted-foreground">View and manage permissions across the platform</p>
      </div>
      <PermissionManagement />
    </div>
  )
}

