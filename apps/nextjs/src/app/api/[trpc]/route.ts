import { appRouter, createContext } from "@acme/api";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Enable cors
  //   await cors(req, res);

  // Let the tRPC handler do its magic
  return createNextApiHandler({
    router: appRouter,
    createContext,
  })(req, res);
};

export { handler as GET, handler as POST };
