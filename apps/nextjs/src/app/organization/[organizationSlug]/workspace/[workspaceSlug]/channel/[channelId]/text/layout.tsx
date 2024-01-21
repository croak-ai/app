"use client";

import React from "react";
import { FeatureToggleProvider } from "@/components/playground-editor/FeatureToggleProvider";
import { InspectorProvider } from "@/components/playground-editor/InspectorProvider";
import { ProseStateProvider } from "@/components/playground-editor/ProseStateProvider";
import { ShareProvider } from "@/components/playground-editor/ShareProvider";
import { MilkdownProvider } from "@milkdown/react";
import { ProsemirrorAdapterProvider } from "@prosemirror-adapter/react";
import { compose } from "@/utils/compose";

const Provider = compose(
  FeatureToggleProvider,
  MilkdownProvider,
  ProsemirrorAdapterProvider,
  ProseStateProvider,
  ShareProvider,
  InspectorProvider,
);
// import "@milkdown/theme-nord/style.css";
// import "@/styles/docsearch.css";
// import "@/styles/prosemirror.css";
// import "@/styles/prose.css";
// import "@/styles/playground.css";
// import "@/styles/toast.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <div>{children}</div>
    </Provider>
  );
};

export default Layout;
