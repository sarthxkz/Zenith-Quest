import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Match all application routes inside the dashboard/explorer area
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/satellites(.*)',
  '/sky-dome(.*)',
  '/timeline(.*)',
  '/missions(.*)',
  '/profile(.*)',
  '/analytics(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static assets
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
