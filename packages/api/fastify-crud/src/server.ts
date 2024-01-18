/* Initalize Fastify and register CORS/router */
import Fastify from "fastify";
import cors from "@fastify/cors";
import router from "./fastify/router";
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { createContext, appRouter, type AppRouter } from "./trpc";

const fastify = Fastify({
  maxParamLength: 5000,
});

const nextDomain = process.env.NEXT_APP_DOMAIN || "http://localhost:3000";
const urls = [nextDomain];

fastify.register(cors, {
  origin: urls,
  credentials: true,
});

fastify.register(router);

fastify.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      // report to error monitoring
      console.error(`Error in tRPC handler on path '${path}':`, error);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

const port = Number(process.env.FASTIFY_CRUD_PORT) || 3002;

fastify.listen({ port }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀  Fastify server running on ${address}`);
});
