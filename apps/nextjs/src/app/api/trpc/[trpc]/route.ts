import { appRouter, createContext } from "@acme/fastify-crud/src/trpc";
import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from "@trpc/server/adapters/fetch";
import { type NextRequest, type NextResponse } from "next/server";

export const maxDuration = 300;

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "http://localhost:3002/trpc",
    req,
    router: appRouter,
    createContext,
    onError:
      process.env.NODE_ENV === "development"
        ? // env.NODE_ENV === "development"
          ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
