export function createResponsivePage(): void {
  const topLeft = {
    x: figma.viewport.bounds.x + 100,
    y: figma.viewport.bounds.y + 100,
  };

  const gap = 32;

  const desktop = figma.createComponent();
  desktop.name = "minWidth=1024";
  desktop.layoutMode = "VERTICAL";
  desktop.paddingTop =
    desktop.paddingBottom =
    desktop.paddingLeft =
    desktop.paddingRight =
      32;
  desktop.resize(1440, 1080);
  desktop.backgrounds = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

  const tablet = figma.createComponent();
  tablet.name = "minWidth=768";
  tablet.layoutMode = "VERTICAL";
  tablet.paddingTop =
    tablet.paddingBottom =
    tablet.paddingLeft =
    tablet.paddingRight =
      32;
  tablet.resize(1024, 768);
  tablet.backgrounds = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

  const mobile = figma.createComponent();
  mobile.name = "minWidth=0";
  mobile.layoutMode = "VERTICAL";
  mobile.paddingTop =
    mobile.paddingBottom =
    mobile.paddingLeft =
    mobile.paddingRight =
      32;
  mobile.resize(375, 812);
  mobile.backgrounds = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

  const componentSet = figma.combineAsVariants(
    [desktop, tablet, mobile],
    figma.currentPage
  );
  componentSet.name = "Page";
  // componentSet.editComponentProperty(
  //   Object.keys(componentSet.componentPropertyDefinitions)[0],
  //   { name: "breakpoint" }
  // );
  componentSet.strokes = [
    {
      type: "SOLID",
      color: {
        r: 0x97 / 0xff,
        g: 0x47 / 0xff,
        b: 0xff / 0xff,
      },
    },
  ];

  componentSet.x = topLeft.x;
  componentSet.y = topLeft.y;
  componentSet.layoutMode = "HORIZONTAL";
  componentSet.counterAxisSizingMode = "AUTO";
  componentSet.itemSpacing = gap;
  componentSet.paddingTop =
    componentSet.paddingRight =
    componentSet.paddingBottom =
    componentSet.paddingLeft =
      gap;
}
