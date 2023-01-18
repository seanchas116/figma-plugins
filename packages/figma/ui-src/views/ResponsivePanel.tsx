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
      <Button
        onClick={() => {
          rpc.remote.copyStylesToLargerScreens();
        }}
      >
        <iconify-icon
          className="text-base"
          icon="material-symbols:desktop-windows-outline"
        ></iconify-icon>
        Copy Styles to Larger Screens
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
        Copy Styles to Smaller Screens
      </Button>
      {/* <label className="flex gap-1 items-center">
        <input type="checkbox" checked />
        Auto-sync breakpoint contents
      </label> */}
    </div>
  );
};
