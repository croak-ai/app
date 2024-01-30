/* Everything needed to create a TRPC client will be available here */

export { appRouter, type AppRouter } from "./routes";
export {
  createTRPCContextFromHonoContext,
  type Context,
} from "./config/context";
export { transformer } from "./config/transformer";
