import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const handleRefreshToken = async (request: NextRequest) => {
  const path = request.nextUrl.searchParams.get('redirect');

  if (!path) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('firebaseAuthRefreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // TODO: Add FIREBASE_SERVER_API_KEY to development env variables once confirmed working in production with the existing key
    const apiKey =
      process.env.FIREBASE_SERVER_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase server API key not configured');
    }

    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      },
    );

    const json = await response.json();

    const newToken = json.id_token;

    if (json.error || !newToken) {
      console.error('[refresh-token] Firebase error:', json.error);
      const response = NextResponse.redirect(
        new URL('/?clear_client_session=true', request.url),
      );
      response.cookies.delete('firebaseAuthToken');
      response.cookies.delete('firebaseAuthRefreshToken');
      return response;
    }

    cookieStore.set('firebaseAuthToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60,
    });

    return NextResponse.redirect(new URL(path, request.url));
  } catch (_error) {
    console.error('[refresh-token] Error during token refresh:', _error);
    console.error(
      '[refresh-token] Error message:',
      _error instanceof Error ? _error.message : 'Unknown error',
    );
    console.error(
      '[refresh-token] Error stack:',
      _error instanceof Error ? _error.stack : 'No stack',
    );
    const response = NextResponse.redirect(
      new URL('/?clear_client_session=true', request.url),
    );
    response.cookies.delete('firebaseAuthToken');
    response.cookies.delete('firebaseAuthRefreshToken');
    return response;
  }
};

export const GET = handleRefreshToken;
export const POST = handleRefreshToken;
