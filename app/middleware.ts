import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/register')

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/boards (public board endpoints - GET only)
     * - api/posts (public post endpoints - GET only) 
     * - api/partners (public partner endpoints - GET only)
     * - api/live (public live match endpoints - GET only)
     * - api/public (public API endpoints)
     * - posts (public board pages)
     * - notice (public notice pages)
     * - matches (public matches page)
     * - analysis (public analysis page)
     * - live (public live streaming page)
     * - partners (public partners page)
     * - support (public support page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - root (/)
     */
    '/((?!api/auth|api/boards|api/posts|api/partners|api/live|api/public|posts|notice|matches|analysis|live|partners|support|_next/static|_next/image|favicon.ico|public|$).*)',
  ]
}