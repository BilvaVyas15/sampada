import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from '@/lib/env';

const publicPaths = ['/login', '/access-denied', '/supabase-not-configured', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const env = getSupabaseEnv();
  if (!env.ok && pathname !== '/supabase-not-configured' && pathname !== '/api/health') {
    return NextResponse.redirect(new URL('/supabase-not-configured', request.url));
  }

  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  if (!env.ok) return NextResponse.redirect(new URL('/supabase-not-configured', request.url));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    env.value.NEXT_PUBLIC_SUPABASE_URL,
    env.value.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !profile || !profile.is_active) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  const allowedRoles: Record<string, string[]> = {
    '/verifications': ['admin', 'officer'],
    '/admin': ['admin'],
  };
  const restrictedPath = Object.keys(allowedRoles).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (restrictedPath && !allowedRoles[restrictedPath].includes(profile.role)) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  const isAssetEditorRoute = pathname === '/assets/new' || /^\/assets\/[^/]+\/edit\/?$/.test(pathname);
  if (isAssetEditorRoute && !['admin', 'officer'].includes(profile.role)) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};