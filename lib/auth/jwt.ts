import { auth } from "./auth"
import { headers } from "next/headers"

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret-key-min-32-characters-long")

export interface SessionPayload {
  userId: string
  email: string
  name: string | null
  expiresAt: Date
}

export async function createSession(userId: string, email: string, name: string | null) {
  // Better Auth handles session creation automatically on sign in
  // This function is kept for compatibility but delegates to Better Auth
  console.warn("createSession is deprecated - Better Auth handles sessions automatically")
  return { token: "", expiresAt: new Date() }
}

export async function verifySession(): Promise<SessionPayload | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user || !session?.session) {
      return null
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name || null,
      expiresAt: new Date(session.session.expiresAt),
    }
  } catch {
    return null
  }
}

export async function deleteSession() {
  // Better Auth handles session deletion via signOut
  console.warn("deleteSession is deprecated - use signOut from client")
}

export async function getSession() {
  return await verifySession()
}
