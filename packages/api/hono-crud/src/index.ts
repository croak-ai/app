import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./trpc/routes";

export { type Context } from "./trpc/config/context";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export { type AppRouter } from "./trpc/routes";

export { CroakDurableObject } from "./hono-routes/websocket/croak-durable-object";
