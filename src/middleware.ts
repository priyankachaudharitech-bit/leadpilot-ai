import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROUTES } from '@/lib/utils/constants';

export async function middleware(request: NextRequest) {
  const publicRoutes = [
    ROUTES.login,
    ROUTES.register,
    ROUTES.forgotPassword,
    ROUTES.resetPassword,
    '/auth/callback',
    '/',
  ];

  const { pathname } = request.nextUrl;

  // Don't protect public routes (exact matches)
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check prefix matches for public routes, excluding root '/'
  const isPublicRoute = publicRoutes
    .filter((route) => route !== '/')
    .some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      ...request,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    pathname === ROUTES.login ||
    pathname === ROUTES.register ||
    pathname === ROUTES.forgotPassword ||
    pathname === ROUTES.resetPassword;

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  // If user is not authenticated and trying to access protected routes
  if (!user && !publicRoutes.includes(pathname)) {
    const redirectTo = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(
      new URL(`${ROUTES.login}?redirectTo=${redirectTo}`, request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|webp|ico|svg|woff2?|ttf|otf)).*)',
    '/',
  ],
};
