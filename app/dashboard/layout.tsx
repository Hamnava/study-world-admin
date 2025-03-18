import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await auth();

  const user = session?.user.accessToken;
  if(!user){
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 justify-start gap-2">
        <DashboardSidebar />
        <main className="flex-1 p-6 w-full">{children}</main>
      </div>
    </div>
  )
}

