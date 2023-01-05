type MessageData =
  | { type: "call"; callID: number; name: string; args: any[] }
  | {
      type: "result";
      callID: number;
      status: "success" | "error";
      value: any;
    };

export class RPC<Self, Remote> {
  static toIFrame<Self, Remote>(iframe: HTMLIFrameElement, handler: Self) {
    return new RPC<Self, Remote>({
      post: (message) => iframe.contentWindow?.postMessage(message, "*"),
      subscribe: (handler) => {
        const onMessage = (event: MessageEvent) => {
          if (event.source === iframe.contentWindow) {
            handler(event.data);
          }
        };
        window.addEventListener("message", onMessage);
        return () => {
          window.removeEventListener("message", onMessage);
        };
      },
      handler,
    });
  }

  static toParentWindow<Self, Remote>(handler: Self) {
    return new RPC<Self, Remote>({
      post: (message) => window.parent.postMessage(message, "*"),
      subscribe: (handler) => {
        const onMessage = (event: MessageEvent) => {
          if (event.source === window || event.source !== window.parent) {
            return;
          }
          handler(event.data);
        };
        window.addEventListener("message", onMessage);
        return () => {
          window.removeEventListener("message", onMessage);
        };
      },
      handler,
    });
  }

  constructor({
    post,
    subscribe,
    handler,
  }: {
    post: (data: MessageData) => void;
    subscribe: (handler: (data: MessageData) => void) => () => void;
    handler: Self;
  }) {
    this.disposeHandler = subscribe(async (data) => {
      if (data.type === "call") {
        try {
          const result = await (handler as any)[data.name](...data.args);
          post({
            type: "result",
            callID: data.callID,
            status: "success",
            value: result,
          });
        } catch (error) {
          post({
            type: "result",
            callID: data.callID,
            status: "error",
            value: String(error),
          });
        }
      } else {
        const resolver = this.resolvers.get(data.callID);
        if (resolver) {
          if (data.status === "error") {
            resolver.reject(data.value);
          } else {
            resolver.resolve(data.value);
          }
          this.resolvers.delete(data.callID);
        }
      }
    });

    this.remote = new Proxy(
      {},
      {
        get: (_, name: string) => {
          return (...args: any[]) => {
            return new Promise((resolve, reject) => {
              const callID = Math.random();
              this.resolvers.set(callID, { resolve, reject });
              post({ type: "call", callID, name, args });
            });
          };
        },
      }
    ) as Remote;
  }

  readonly remote: Remote;
  private resolvers = new Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (error: unknown) => void;
    }
  >();
  private disposeHandler: () => void;

  dispose() {
    this.disposeHandler();
  }
}
