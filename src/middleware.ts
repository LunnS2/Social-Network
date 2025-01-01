// social-network\src\middleware.tsx

import { clerkMiddleware } from "@clerk/nextjs/server";

// Middleware function to protect routes
export default clerkMiddleware(async (auth, req) => {
  // Allow access to the root path ("/") without authentication
  if (req.nextUrl.pathname !== "/") {
    await auth.protect(); // Protect all other routes
  }
});

// Configuration for the middleware
export const config = {
  matcher: [
    // Match all paths except for the root ("/") and skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};