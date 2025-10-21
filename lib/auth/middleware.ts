import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./index"

/**
 * Middleware for protecting routes
 */

export async function authMiddleware(request: NextRequest) {
  const session = await auth()

  // Protected routes
  const protectedPaths = ["/dashboard", "/api/upload", "/api/generate", "/api/documents", "/api/questions"]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !session?.user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
