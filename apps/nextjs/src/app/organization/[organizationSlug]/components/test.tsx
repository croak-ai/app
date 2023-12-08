"use client";

import { trpc } from "@next/app/_trpc/client";

export const Test = () => {
  const data = trpc.post.all.useQuery();
  return <div>BOOM: {data.data}</div>;
};

export default Test;
