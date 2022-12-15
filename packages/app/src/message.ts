export type MessageToRenderIFrame = {
  type: "iframe:render";
  payload: {
    component: string;
    props: Record<string, any>;
    width: number;
    height: number;
  };
};

export type MessageFromRenderIFrame = {
  type: "iframe:renderDone";
  payload: {
    png: ArrayBuffer;
  };
};
