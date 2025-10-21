import { auth } from "./auth"
import { headers } from "next/headers"

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
 * Get the current session from Better Auth
 * Returns null if no valid session exists
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user || !session?.session) {
      return null
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || "",
      },
      expires: new Date(session.session.expiresAt).toISOString(),
    }
  } catch (error) {
    console.error("Session verification error:", error)
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
 * Alias for requireAuth for compatibility
 */
export async function requireUser(): Promise<SessionUser> {
  return requireAuth()
}

/**
 * Get user ID from session
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}
