import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()

  // Check for session cookie
  const hasSessionCookie =
    cookieStore.has('next-auth.session-token') ||
    cookieStore.has('__Secure-next-auth.session-token')

  if (!hasSessionCookie) {
    redirect('/login')
  } else {
    redirect('/dashboard')
  }

  return null
}
