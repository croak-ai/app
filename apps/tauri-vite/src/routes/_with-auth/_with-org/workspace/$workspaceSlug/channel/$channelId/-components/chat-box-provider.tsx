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

const ChatBoxProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <div>{children}</div>
    </Provider>
  );
};

export default ChatBoxProvider;
