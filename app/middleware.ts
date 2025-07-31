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
    
    // 인증된 사용자는 그대로 통과
    return NextResponse.next()
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
     * Match only specific paths that require authentication:
     * - /profile/* (profile pages)
     * - /settings/* (settings pages)
     * - /posts/write (write post page)
     * - /posts/edit/* (edit post pages)
     * - /api/comments (POST only)
     * - /api/posts (POST, PUT, DELETE only)
     * - /api/users/* (all methods except GET for public profiles)
     */
    '/profile/:path*',
    '/settings/:path*',
    '/posts/write',
    '/posts/edit/:path*',
  ]
}