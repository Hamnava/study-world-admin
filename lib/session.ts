import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Simple function to check if user is authenticated
export async function requireAuth() {
  const cookieStore = await cookies()

  // Check for session cookie
  const hasSessionCookie =
    cookieStore.has('next-auth.session-token') ||
    cookieStore.has('__Secure-next-auth.session-token')

  if (!hasSessionCookie) {
    redirect('/login')
  }

  // Return true if authenticated
  return true
}
