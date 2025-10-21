import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "@/lib/auth/jwt"

/**
 * Middleware for protecting routes
 */

export default async function middleware(request: NextRequest) {
  const session = await verifySession()

  // Protected routes
  const protectedPaths = ["/dashboard", "/api/upload", "/api/generate", "/api/documents", "/api/questions"]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
