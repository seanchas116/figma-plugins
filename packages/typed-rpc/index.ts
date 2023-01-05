type MessageData =
  | { type: "call"; callID: number; name: string; args: any[] }
  | {
      type: "result";
      callID: number;
      status: "success" | "error";
      value: any;
    };

export class RPC<Self, Remote> {
  constructor(
    send: (data: MessageData) => void,
    listen: (handler: (data: MessageData) => void) => () => void,
    handler: Self
  ) {
    this.disposeHandler = listen(async (data) => {
      if (data.type === "call") {
        try {
          const result = await (handler as any)[data.name](...data.args);
          send({
            type: "result",
            callID: data.callID,
            status: "success",
            value: result,
          });
        } catch (error) {
          send({
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
              send({ type: "call", callID, name, args });
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
