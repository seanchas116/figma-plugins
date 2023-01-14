import { setResponsiveFrameData } from "../pluginData";

export function createResponsivePage(): void {
  const topLeft = {
    x: figma.viewport.bounds.x + 100,
    y: figma.viewport.bounds.y + 100,
  };

  const gap = 32;

  const desktop = figma.createComponent();
  desktop.name = "Desktop";
  desktop.x = gap;
  desktop.y = gap;
  desktop.layoutMode = "VERTICAL";
  desktop.paddingTop =
    desktop.paddingBottom =
    desktop.paddingLeft =
    desktop.paddingRight =
      32;
  desktop.resize(1440, 1080);
  desktop.backgrounds = [
    {
      type: "SOLID",
      color: {
        r: 1,
        g: 1,
        b: 1,
      },
    },
  ];
  setResponsiveFrameData(desktop, {});

  const mobile = figma.createComponent();
  mobile.name = "Mobile";
  mobile.x = gap + desktop.width + gap;
  mobile.y = gap;
  mobile.layoutMode = "VERTICAL";
  mobile.paddingTop =
    mobile.paddingBottom =
    mobile.paddingLeft =
    mobile.paddingRight =
      32;
  mobile.resize(375, 812);
  mobile.backgrounds = [
    {
      type: "SOLID",
      color: {
        r: 1,
        g: 1,
        b: 1,
      },
    },
  ];
  setResponsiveFrameData(mobile, {
    maxWidth: 375,
  });

  const componentSet = figma.combineAsVariants(
    [desktop, mobile],
    figma.currentPage
  );
  componentSet.name = "Page";

  componentSet.x = topLeft.x;
  componentSet.y = topLeft.y;
}
