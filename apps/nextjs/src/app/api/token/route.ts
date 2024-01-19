import { auth } from "@clerk/nextjs";

export async function GET() {
  const { getToken } = auth();

  const sessionToken = await getToken();
  // This is a simple example that responds with a JSON object
  return Response.json({ sessionToken });
}
