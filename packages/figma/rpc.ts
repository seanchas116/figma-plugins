import { InstanceInfo, TargetInfo, Assets, ComponentInfo } from "./data";

export interface UIToPluginRPC {
  ready(): Promise<void>;
  updateInstance(instance?: InstanceInfo): Promise<void>;
  syncAssets(assets: Assets): Promise<void>;
  resize(width: number, height: number): Promise<void>;
}

export interface PluginToUIRPC {
  render(
    component: ComponentInfo,
    props: Record<string, any>,
    width?: number,
    height?: number
  ): Promise<{
    png: ArrayBuffer;
    width: number;
    height: number;
  }>;
  onTargetChange(target: TargetInfo | undefined): Promise<void>;
}

type MessageData =
  | { type: "call"; callID: number; name: string; args: unknown[] }
  | {
      type: "result";
      callID: number;
      status: "success" | "error";
      value: unknown;
    };

export class RPC<Self, Remote> {
  constructor(
    send: (data: MessageData) => void,
    listen: (handler: (data: MessageData) => void) => void,
    handler: Self
  ) {
    listen(async (data) => {
      if (data.type === "call") {
        try {
          const result = await handler[data.type](...data.args);
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
}
