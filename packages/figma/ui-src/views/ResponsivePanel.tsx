import { FunctionComponent } from "preact";
import { Button } from "../components/Button";
import { rpc } from "../rpc";

export const ResponsivePanel: FunctionComponent = () => {
  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Button
        onClick={() => {
          rpc.remote.createResponsivePage();
        }}
      >
        Create Responsive Page
      </Button>
      <h1 className="font-bold">Sync Contents</h1>
      <p>
        Sync contents and layer structure of the current screen to other
        screens. Layout and size related properties are not synced.
      </p>
      <Button
        onClick={() => {
          rpc.remote.syncResponsiveContents();
        }}
      >
        <iconify-icon
          className="text-base"
          icon="material-symbols:sync-outline"
        ></iconify-icon>
        Sync Contents
      </Button>
      <h1 className="font-bold">Sync All Properties</h1>
      <p>Sync all properties including layout and size related ones.</p>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            rpc.remote.copyStylesToLargerScreens();
          }}
        >
          <iconify-icon
            className="text-base"
            icon="material-symbols:desktop-windows-outline"
          ></iconify-icon>
          Sync All to Larger Screens
        </Button>
        <Button
          onClick={() => {
            rpc.remote.copyStylesToSmallerScreens();
          }}
        >
          <iconify-icon
            className="text-base"
            icon="material-symbols:phone-android-outline"
          ></iconify-icon>
          Sync All to Smaller Screens
        </Button>
      </div>
      {/* <label className="flex gap-1 items-center">
        <input type="checkbox" checked />
        Auto-sync breakpoint contents
      </label> */}
      <div>
        <div className="font-bold">Known issue:</div>
        <div>
          When you turn groups into frames or vice versa while opening the
          plugin, auto-sync will not work for them. (Cut-paste the group/frame
          to fix this.)
        </div>
      </div>
    </div>
  );
};
