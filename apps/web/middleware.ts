import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/webhooks/(.*)',
  '/api/ai/voice-demo',
]);

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);
const isStudioRoute = createRouteMatcher(['/studio(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Public routes — no auth needed
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Not signed in — redirect to login
  if (!userId) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const publicMetadata = (sessionClaims?.publicMetadata || {}) as Record<string, unknown>;
  const role = publicMetadata.role as string | undefined;
  const isDev = process.env.NODE_ENV === 'development';
  
  // Check onboarding status from BOTH Clerk publicMetadata AND a fallback cookie.
  // Clerk's JWT refresh can be delayed, so the cookie acts as an instant bridge.
  const clerkOnboardingDone = publicMetadata.onboarding_complete as boolean | undefined;
  const cookieOnboardingDone = req.cookies.get('sahayak_onboarding_done')?.value === '1';
  const onboardingComplete = clerkOnboardingDone || cookieOnboardingDone;

  // Studio routes — NGO admin only (dev: bypass role check)
  if (isStudioRoute(req)) {
    if (!isDev && role !== 'ngo_admin') {
      return NextResponse.rewrite(new URL('/not-found', req.url));
    }
    return NextResponse.next();
  }

  // Admin routes — sys_admin only (dev: bypass role check)
  if (isAdminRoute(req)) {
    if (!isDev && role !== 'sys_admin') {
      return NextResponse.rewrite(new URL('/not-found', req.url));
    }
    return NextResponse.next();
  }

  // Onboarding routes — redirect to dashboard if already complete
  // Exception: ?addElder=true allows returning to onboarding to add another profile
  if (isOnboardingRoute(req)) {
    const isAddingElder = req.nextUrl.searchParams.get('addElder') === 'true';
    if (onboardingComplete && !isAddingElder) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Dashboard routes — redirect to onboarding if not complete
  if (isDashboardRoute(req)) {
    if (!onboardingComplete) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|glb|gltf)).*)',
    '/(api|trpc)(.*)',
  ],
};
