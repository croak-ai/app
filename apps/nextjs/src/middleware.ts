import { NextResponse } from "next/server";
import { authMiddleware, RedirectToSignIn } from "@clerk/nextjs";
import { redirectToSignIn } from "@clerk/nextjs/server";
export default authMiddleware({
  afterAuth(auth, req, evt) {
    // handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Allow tRPC requests to bypass the onboarding redirect
    if (req.nextUrl.pathname.startsWith("/trpc/")) {
      return NextResponse.next();
    }

    const publicMetadata: any = auth.sessionClaims?.org_public_metadata;

    const redirectUrl = `/organization/${auth.orgSlug}/onboarding`;

    if (req.nextUrl.pathname.startsWith("/sign-in")) {
      return NextResponse.next();
    }

    if (req.nextUrl.pathname.includes(redirectUrl)) {
      return NextResponse.next();
    }

    if (auth.isApiRoute) {
      return NextResponse.next();
    }

    if (
      !publicMetadata?.main_database_turso_org_name ||
      !publicMetadata?.main_database_turso_group_name ||
      !publicMetadata?.main_database_turso_db_name
    ) {
      const url = req.nextUrl.clone();
      url.pathname = `/organization/${auth.orgSlug}/onboarding`;
      return NextResponse.rewrite(url);
    }
  },
});
// Stop Middleware running on static files
export const config = {
  matcher: [
    /*
     * Match request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     *
     * This includes images, and requests from TRPC.
     */
    "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
  ],
};
