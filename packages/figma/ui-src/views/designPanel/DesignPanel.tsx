import { observer } from "mobx-react-lite";
import { ResponsiveSection } from "./ResponsiveSection";
import { InstanceSection } from "./InstanceSection";

export const DesignPanel: React.FC = observer(() => {
  return (
    <div>
      {/* <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-200">
        <div className="flex gap-2 items-center">
          <div className="flex gap-1.5 items-center">
            <Icon
              icon="material-symbols:grid-view"
              className="font-base text-gray-400"
            />
            <span className="font-medium">Page 1</span>
          </div>
          <Icon
            icon="material-symbols:chevron-right"
            className="text-xs text-gray-400"
          />
          <div className="flex gap-1.5 items-center">
            <Icon
              icon="material-symbols:desktop-windows-outline"
              className="font-base text-gray-400"
            />
            <span className="font-medium">1280-</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <Icon
              icon="material-symbols:chevron-right"
              className="text-xs text-gray-400"
            />
            <span className="font-medium">HeroSection</span>
          </div>
        </div>
      </div> */}
      <ResponsiveSection />
      <InstanceSection />
    </div>
  );
});
