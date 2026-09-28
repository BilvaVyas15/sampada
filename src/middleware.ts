import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/login', '/access-denied', '/auth/signout'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const localDemoRole = process.env.NODE_ENV !== 'production'
    ? request.cookies.get('sampada_local_demo')?.value
    : undefined;
  if (localDemoRole && ['admin', 'officer', 'inspector', 'viewer'].includes(localDemoRole)) {
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    const isVerificationRoute = pathname === '/verifications' || pathname.startsWith('/verifications/');
    const isAssetEditorRoute = pathname === '/assets/new' || /^\/assets\/[^/]+\/edit\/?$/.test(pathname);
    if (isAdminRoute && localDemoRole !== 'admin') {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    if (isVerificationRoute && !['admin', 'officer'].includes(localDemoRole)) {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    if (isAssetEditorRoute && !['admin', 'officer'].includes(localDemoRole)) {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    return NextResponse.redirect(new URL('/login?setup=missing', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

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