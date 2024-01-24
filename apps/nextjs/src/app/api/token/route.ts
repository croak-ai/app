/* This route was made to grab the session token from the client */
import { auth } from "@clerk/nextjs";

export async function GET() {
  const { getToken } = auth();
  const sessionToken = await getToken();
  return Response.json({ sessionToken });
}
