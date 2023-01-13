import { setResponsiveFrameData } from "../pluginData";

export function createResponsivePage(): void {
  const topLeft = {
    x: figma.viewport.bounds.x + 100,
    y: figma.viewport.bounds.y + 100,
  };

  const gap = 32;

  const section = figma.createSection();
  section.name = "Page";
  section.x = topLeft.x;
  section.y = topLeft.y;

  const desktop = figma.createFrame();
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
  setResponsiveFrameData(desktop, {});

  section.appendChild(desktop);

  const mobile = figma.createFrame();
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
  setResponsiveFrameData(mobile, {
    maxWidth: 375,
  });

  section.appendChild(mobile);

  section.resizeWithoutConstraints(
    desktop.width + mobile.width + gap * 3,
    Math.max(desktop.height, mobile.height) + gap * 2
  );
}
