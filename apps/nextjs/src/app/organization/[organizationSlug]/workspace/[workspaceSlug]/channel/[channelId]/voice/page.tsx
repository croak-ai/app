"use client";

import HomeEditor from "@/components/home-editor";

const doc = `
# Like this one

> I'll see you on the dark side of the moon.  -- Roger Waters

Try it out by typing in here, or visiting the [online playground](/playground).
`;

export const Page = () => {
  return (
    <div className="mt-24">
      <HomeEditor value={doc.trim()} />
    </div>
  );
};

export default Page;
