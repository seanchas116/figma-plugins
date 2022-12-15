export type MessageToPlugin =
  | {
      type: "ready";
    }
  | {
      type: "renderStart";
    }
  | {
      type: "renderDone";
      payload: {
        png: ArrayBuffer;
      };
    };

export type MessageToUI = {
  type: "render";
  width: number;
  height: number;
};
