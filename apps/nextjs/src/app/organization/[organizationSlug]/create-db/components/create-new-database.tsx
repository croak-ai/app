// If you are reading this Nick, I will make this a server component I pwomise

"use client";

import { reactTRPC } from "@next/utils/trpc/reactTRPCClient";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export const Test = () => {
  const mutation = reactTRPC.createNewTursoDB.createNewTursoDB.useMutation();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      await mutation.mutateAsync();
    };
    const orgSlug = params?.organizationSlug;
    router.push(`/organization/${orgSlug}`);

    fetchData();
  }, []);

  return <div>Creating Database...</div>;
};

export default Test;
