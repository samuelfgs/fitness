import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { createClient } from './lib/supabase/server'

export async function proxy(request: NextRequest) {
  // First update session to refresh token if needed
  const response = await updateSession(request)
  
  // Check if user is authenticated
  const supabase = await createClient()
  
  const isAuthPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/auth')

  if (!supabase) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && !isAuthPage) {
    // Redirect unauthenticated users to home page
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && request.nextUrl.pathname === '/') {
    // Redirect authenticated users to dashboard if they try to access login page
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}