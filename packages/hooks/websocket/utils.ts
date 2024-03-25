import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@croak/hono-crud/src/trpc";

export const trpc = createTRPCReact<AppRouter>();

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// We will use this in the route loaders
export type apiUtilsType = ReturnType<typeof createTRPCQueryUtils<AppRouter>>;
