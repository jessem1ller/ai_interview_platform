// @ts-ignore - Bypassing a phantom type error
import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  // List all pages that can be visited without being logged in.
  publicRoutes: ['/', '/sign-in', '/sign-up'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};