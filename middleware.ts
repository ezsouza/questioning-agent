import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

/**
 * Middleware for protecting routes with Better Auth
 * Uses cookie-based session verification
 */

export default async function middleware(request: NextRequest) {
  // Check for Better Auth session cookie
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  // Redirect authenticated users away from auth pages to dashboard
  if (sessionCookie && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protected routes
  const protectedPaths = ["/dashboard", "/api/upload", "/api/generate", "/api/documents", "/api/questions"]
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedPath && !sessionCookie) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/api/upload", "/api/generate", "/api/documents/:path*", "/api/questions/:path*"],
}
