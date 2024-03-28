import jwt from "@tsndr/cloudflare-worker-jwt";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import jwkToPem from "jwk-to-pem";
import fetch from "node-fetch";
import { HonoConfig } from "../../config";

interface JWKS {
  keys: Array<jwkToPem.RSA>;
}

export default async function verifyWebSocketRequest({
  token,
  c,
}: {
  token: string;
  c: Context<HonoConfig>;
}) {
  // Attempt to retrieve the cached JWKS from KV
  let jwks: JWKS | null = await c.env.GLOBAL_KV.get("jwks", { type: "json" });

  // Check if JWKS is not in cache or is stale
  if (!jwks) {
    // Fetch new JWKS if not cached or cache is stale
    const jwksResponse = await fetch(c.env.CLERK_JWKS_URL);
    jwks = await jwksResponse.json();

    if (!jwks) {
      throw new HTTPException(500, {
        message: "Internal Server Error: Unable to fetch JWKS",
      });
    }

    // Store the fetched JWKS in KV with an expiration (e.g., 24 hours = 86400 seconds)
    await c.env.GLOBAL_KV.put("jwks", JSON.stringify(jwks), {
      expirationTtl: 86400,
    });
  }

  const jwk = jwks.keys[0]; // Assuming the first key is the one we need

  if (!jwk) {
    throw new HTTPException(500, {
      message: "Internal Server Error: Invalid JWKS",
    });
  }

  const pemPublicKey = jwkToPem(jwk);

  const isValid = await jwt.verify(token, pemPublicKey, { algorithm: "RS256" });

  if (!isValid) {
    throw new HTTPException(401, {
      message: "Unauthorized: Invalid token",
    });
  }

  return await jwt.decode(token);
}
