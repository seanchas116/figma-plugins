export type MessageToRenderIFrame = {
  type: "render";
  payload: {
    name: string;
    props: Record<string, any>;
    width?: number;
    height?: number;
  };
};

export type MessageFromRenderIFrame =
  | {
      type: "renderDone";
      payload: {
        png: ArrayBuffer;
        width: number;
        height: number;
      };
    }
  | {
      type: "components";
      payload: {
        components: {
          name: string;
          props: {
            name: string;
            type: string;
          }[];
        }[];
      };
    };
