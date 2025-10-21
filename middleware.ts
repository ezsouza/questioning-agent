import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware for protecting routes with Better Auth
 * Uses cookie-based session verification
 */

export default async function middleware(request: NextRequest) {
  // Check for Better Auth session cookie
  const sessionToken = request.cookies.get("better-auth.session_token")

  // Protected routes
  const protectedPaths = ["/dashboard", "/api/upload", "/api/generate", "/api/documents", "/api/questions"]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\..*).*)"],
}
