export type MessageToPlugin =
  | {
      type: "ready";
    }
  | {
      type: "renderStart";
    }
  | {
      type: "renderFinish";
      payload: ArrayBuffer;
    };

export type MessageToUI = {
  type: "render";
  width: number;
  height: number;
};
