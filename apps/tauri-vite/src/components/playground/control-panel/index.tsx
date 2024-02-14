import { useTheme } from "@/theme";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@acme/ui/components/ui/accordion";
import clsx from "clsx";
import type { FC, RefObject } from "react";
import { JSONTree } from "react-json-tree";
import type { CodemirrorProps, CodemirrorRef } from "../../codemirror";
import { Codemirror } from "../../codemirror";
import { useProseState } from "../../playground-editor/ProseStateProvider";
import { PluginToggle } from "../plugin-toggle";
import { useShare } from "../../playground-editor/ShareProvider";

interface ControlPanelProps extends CodemirrorProps {
  codemirrorRef: RefObject<CodemirrorRef>;
}

const twilight = {
  scheme: "twilight",
  base00: "#2E3440",
  base01: "#323537",
  base02: "#464b50",
  base03: "#5f5a60",
  base04: "#838184",
  base05: "#a7a7a7",
  base06: "#c3c3c3",
  base07: "#ffffff",
  base08: "#cf6a4c",
  base09: "#cda869",
  base0A: "#f9ee98",
  base0B: "#8f9d6a",
  base0C: "#afc4db",
  base0D: "#7587a6",
  base0E: "#9b859d",
  base0F: "#9b703f",
};

export const ControlPanel: FC<ControlPanelProps> = ({
  content,
  onChange,
  lock,
  codemirrorRef,
}) => {
  const proseState = useProseState();
  const { theme } = useTheme();
  const share = useShare();

  return (
    <div className="h-full">
      <div className="border-nord4 flex h-10 items-center justify-between border-b bg-gray-200 px-4 py-2 font-light dark:border-gray-600 dark:bg-gray-700">
        <div>
          <span>Milkdown Playground</span>
        </div>
        <div>
          <button
            onClick={() => share()}
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-full",
            )}
          >
            <span className="material-symbols-outlined !text-base">share</span>
          </button>
        </div>
      </div>
      <Accordion type="single" collapsible className="h-[calc(100%-2.5rem)]">
        <AccordionItem value="markdown">
          <AccordionTrigger>Markdown</AccordionTrigger>
          <AccordionContent>
            <Codemirror
              ref={codemirrorRef}
              content={content}
              onChange={onChange}
              lock={lock}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="inspector">
          <AccordionTrigger>Inspector</AccordionTrigger>
          <AccordionContent>
            <PluginToggle />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="state">
          <AccordionTrigger>State</AccordionTrigger>
          <AccordionContent>
            <div className="flex min-h-full px-2 [&>*]:!m-0 [&>*]:flex-1 [&>*]:!bg-transparent">
              <JSONTree
                data={proseState}
                theme={twilight}
                invertTheme={theme === "dark"}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
