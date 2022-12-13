export type MessageToPlugin =
  | {
      type: "ready";
    }
  | {
      type: "renderFinish";
      payload: ArrayBuffer;
    };

export type MessageToUI = {
  type: "change";
  // TODO
};
