import NextAuth, { User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { fetcher } from './config/fetcher'

export type AuthUser = {
  id: number
  firstName: string
  lastName: string
  displayName: string
  email: string
  profilePicture: string
  role: string
  userRoles: string[]
  isEmailVerified: boolean
  accessToken: string
  refreshToken: string
  createdAt: string
}

declare module 'next-auth' {
  interface Session {
    user: AuthUser
  }
}

// Helper: Process login response from the server
async function authorizeUser(endpoint: string, payload: object) {
  const res = await fetcher.post<
    {
      user: AuthUser;
    },
    typeof payload
  >(endpoint, payload);
  if (!res?.success || !res?.data) {
    throw new Error(res?.message?.toString());
  }
  const { user } = res.data;
  return {
    ...user,
    id: user.id.toString(),
  };
}


export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Signin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password) {
          return null
        }
        const { email, password } = credentials
        return authorizeUser('/auth/signin', {
          email,
          password,
        })
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (trigger === 'update') {
        return { ...token, user: { ...session.user } }
      }
      if (user) {
        token.user = user
      }
      return token
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: token.user as User,
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  trustHost: true,
})
