export type MessageToApp = {
  type: "electron:render";
  requestID: number;
  payload: {
    width: number;
    height: number;
  };
};

export type MessageFromApp = {
  type: "electron:renderEnd";
  requestID: number;
  payload: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
