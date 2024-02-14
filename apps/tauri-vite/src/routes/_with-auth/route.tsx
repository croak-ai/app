import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isSignedIn) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
