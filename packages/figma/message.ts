export type MessageToPlugin =
  | {
      type: "ready";
    }
  | {
      type: "updateComponent";
      payload: {
        name?: string;
        props: Record<string, any>;
      };
    }
  | {
      type: "renderDone";
      payload: {
        png: ArrayBuffer;
      };
    };

export type MessageToUI =
  | {
      type: "render";
      width: number;
      height: number;
    }
  | {
      type: "componentChanged";
      payload: {
        name?: string;
        props: Record<string, any>;
      };
    };
