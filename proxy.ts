import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(_req: NextRequest) {
  // TODO: re-enable auth before launch
  // import { auth } from '@/lib/auth'
  // export default auth((req) => {
  //   const isLoggedIn = !!req.auth
  //   if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
  //   return NextResponse.next()
  // })
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
