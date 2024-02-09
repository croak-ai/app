/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type {
  R2Bucket,
  DurableObjectNamespace,
} from "@cloudflare/workers-types";
import type { Context, Input } from "hono";

export type Bindings = {
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_ORG_WEBHOOK_SECRET_KEY: string;
  CLERK_USER_WEBHOOK_SECRET_KEY: string;
  TRPC_TURSO_ORG_SLUG: string;
  TRPC_TURSO_AUTH_TOKEN: string;
  DB_ENVIORNMENT_LEVEL: "dev" | "staging" | "prod";
  AMS_SECRET: string;
  BOG_SECRET: string;
  BOM_SECRET: string;
  BOS_SECRET: string;
  CDG_SECRET: string;
  DEN_SECRET: string;
  DFW_SECRET: string;
  EWR_SECRET: string;
  EZE_SECRET: string;
  FRA_SECRET: string;
  GDL_SECRET: string;
  GIG_SECRET: string;
  GRU_SECRET: string;
  HKG_SECRET: string;
  IAD_SECRET: string;
  JNB_SECRET: string;
  LAX_SECRET: string;
  LHR_SECRET: string;
  MAD_SECRET: string;
  MIA_SECRET: string;
  NRT_SECRET: string;
  ORD_SECRET: string;
  OTP_SECRET: string;
  PHX_SECRET: string;
  QRO_SECRET: string;
  SCL_SECRET: string;
  SEA_SECRET: string;
  SIN_SECRET: string;
  SJC_SECRET: string;
  SYD_SECRET: string;
  WAW_SECRET: string;
  YUL_SECRET: string;
  YYZ_SECRET: string;
  // KNIGHT_HACKS_BUCKET: R2Bucket;
};

export type HonoConfig = {
  Bindings: Bindings;
};

export type HonoContext<
  P extends string = string,
  I extends Input = Input,
> = Context<HonoConfig, P, I>;
