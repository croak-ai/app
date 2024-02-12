import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@croak/hono-crud/src/trpc";

export const trpc = createTRPCReact<AppRouter>();

// We will use this in the route loaders
export type apiUtilsType = ReturnType<typeof createTRPCQueryUtils<AppRouter>>;
