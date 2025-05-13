// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get pathname of request (e.g. /, /dashboard, etc.)
  const path = request.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/auth/login' || 
                       path === '/auth/forgot-password' || 
                       path === '/auth/register' ||
                       path === '/'
  
  // Check if trying to access protected route
  const isProtectedPath = path.startsWith('/dashboard')
  
  // For protected paths, let the client-side auth handle it
  // Middleware can't read localStorage, so we'll rely on the client-side auth context
  if (isProtectedPath) {
    // Add a header to indicate this is a protected route
    const response = NextResponse.next()
    response.headers.set('x-protected-route', 'true')
    return response
  }
  
  // For root path, redirect to login
  if (path === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}