import { getServerTRPCClient } from "@next/utils/trpc/serverTRPCClient";
import { redirect } from "next/navigation";

export const CreateDatabase = async ({ orgSlug }: { orgSlug: string }) => {
  try {
    const tRPCClient = getServerTRPCClient();

    await tRPCClient.createNewTursoDB.createNewTursoDB.mutate();

    return <>Database Created</>;
  } catch (e) {
    console.error(e);
    return <>Error creating database</>;
  }
};

export default CreateDatabase;
