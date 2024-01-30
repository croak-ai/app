/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { R2Bucket } from "@cloudflare/workers-types";
import type { Context, Input } from "hono";

export type Bindings = {
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_WEBHOOK_SECRET_KEY: string;
  TRPC_TURSO_DB_TOKEN: string;
  TRPC_TURSO_ORG_SLUG: string;
  TRPC_TURSO_DEFAULT_GROUP: string;
  TRPC_TURSO_AUTH_TOKEN: string;
  // KNIGHT_HACKS_BUCKET: R2Bucket;
};

export type HonoConfig = {
  Bindings: Bindings;
};

export type HonoContext<
  P extends string = string,
  I extends Input = Input,
> = Context<HonoConfig, P, I>;
