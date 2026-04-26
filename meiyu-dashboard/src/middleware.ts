import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req });

  const publicPaths = ['/', '/login', '/auth/callback', '/api/evaluate', '/student', '/teacher', '/login/demo'];
  const isPublic = publicPaths.some(p => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith('/_next'));

  if (isPublic) return supabaseResponse;

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
