import { Switch } from "@acme/ui/components/ui/switch";
import type { FC } from "react";
import {
  useFeatureToggle,
  useSetFeatureToggle,
} from "../../playground-editor/FeatureToggleProvider";

const ToggleItem: FC<{
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label: string;
}> = ({ checked, onCheckedChange, label }) => {
  return (
    <div className="flex items-center gap-4 px-10">
      <Switch
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value)}
      />

      <span>{label}</span>
    </div>
  );
};

export const PluginToggle: FC = () => {
  const {
    enableGFM,
    enableMath,
    enableDiagram,
    enableBlockHandle,
    enableTwemoji,
  } = useFeatureToggle();
  const setFeatureToggle = useSetFeatureToggle();
  return (
    <div className="mb-1 flex h-full flex-col gap-8 py-4">
      <div className="flex flex-col gap-4">
        <ToggleItem
          label={"Enable GFM"}
          checked={enableGFM}
          onCheckedChange={(value) => setFeatureToggle({ enableGFM: value })}
        />
        <ToggleItem
          label={"Enable Math"}
          checked={enableMath}
          onCheckedChange={(value) => setFeatureToggle({ enableMath: value })}
        />
        <ToggleItem
          label={"Enable Diagram"}
          checked={enableDiagram}
          onCheckedChange={(value) =>
            setFeatureToggle({ enableDiagram: value })
          }
        />
        <ToggleItem
          label={"Enable Twemoji"}
          checked={enableTwemoji}
          onCheckedChange={(value) =>
            setFeatureToggle({ enableTwemoji: value })
          }
        />
        <ToggleItem
          label={"Enable Block Handle"}
          checked={enableBlockHandle}
          onCheckedChange={(value) =>
            setFeatureToggle({ enableBlockHandle: value })
          }
        />
      </div>
    </div>
  );
};
