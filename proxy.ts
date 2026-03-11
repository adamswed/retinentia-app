import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebaseAuthToken')?.value;
  const { pathname } = request.nextUrl;

  // Handle root path first (check both '/' and empty string)
  if (pathname === '/' || pathname === '') {
    if (token) {
      // Has valid auth token - redirect to main
      return NextResponse.redirect(new URL('/main', request.url));
    } else if (cookieStore.get('firebaseAuthRefreshToken')?.value) {
      // No auth token but has refresh token - get new auth token first
      return NextResponse.redirect(
        new URL('/api/refresh-token?redirect=/main', request.url),
      );
    }
    // If no token, allow access to root
    return NextResponse.next();
  }

  // Allow unauthenticated access to auth pages
  if (
    !token &&
    (pathname.startsWith('/welcome') ||
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/email-sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/terms-and-conditions') ||
      pathname.startsWith('/privacy-policy'))
  ) {
    return NextResponse.next();
  }

  // Protect authenticated routes - redirect to login if no token
  if (
    !token &&
    (pathname.startsWith('/account/') || pathname.startsWith('/main'))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect authenticated users away from auth pages to main
  if (
    token &&
    (pathname.startsWith('/welcome') ||
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/email-sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/forgot-password'))
  ) {
    return NextResponse.redirect(new URL('/main', request.url));
  }

  // If no token and not handled above, redirect to root
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Token validation for authenticated users
  if (token) {
    const decodedToken = decodeJwt(token);
    if (decodedToken.exp && (decodedToken.exp - 300) * 1000 < Date.now()) {
      return NextResponse.redirect(
        new URL(
          `/api/refresh-token?redirect=${encodeURIComponent(pathname)}`,
          request.url,
        ),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/welcome',
    '/main',
    '/sign-in',
    '/sign-up',
    '/email-sign-in',
    '/forgot-password',
    '/account/:path*',
  ],
};
