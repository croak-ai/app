"use client";

import { useEffect, useState } from "react";
import { trpc } from "./_trpc/client";

export const Test = () => {
  const data = trpc.post.all.useQuery();

  if (data.error) {
    throw data.error;
  }

  return (
    <div>
      I am trying to fetch data from the server: This is the loading:{" "}
      {data.status}
      This is the data: {data.data}
    </div>
  );
};

export default Test;
