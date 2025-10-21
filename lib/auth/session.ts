import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'
)

export interface SessionUser {
  id: string
  email: string
  name: string
}

export interface Session {
  user: SessionUser
  expires: string
}

/**
 * Get the current session from cookies
 * Returns null if no valid session exists
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')

    if (!token?.value) {
      return null
    }

    // Verify and decode the JWT token
    const verified = await jwtVerify(token.value, JWT_SECRET)
    const payload = verified.payload as any

    if (!payload.user || !payload.expires) {
      return null
    }

    // Check if token is expired
    const expiresAt = new Date(payload.expires)
    if (expiresAt < new Date()) {
      return null
    }

    return {
      user: {
        id: payload.user.id,
        email: payload.user.email,
        name: payload.user.name,
      },
      expires: payload.expires,
    }
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

/**
 * Get the current user from the session
 * Returns null if no valid session exists
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session?.user || null
}

/**
 * Check if user is authenticated
 * Returns true if valid session exists
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes and server components that require auth
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized - Authentication required')
  }
  
  return user
}

/**
 * Get user ID from session
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}
