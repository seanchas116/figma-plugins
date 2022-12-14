import express from "express";
import cors from "cors";
import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { z } from "zod";

export type MessageToServer = {
  type: "captureEnd";
  requestID: number;
  payload: {
    width: number;
    height: number;
    dataURL: string;
  };
};

export type MessageFromServer = {
  type: "capture";
  requestID: number;
  payload: {
    width: number;
    height: number;
  };
};

const messageHandlers = new Map<
  number,
  (payload: MessageToServer["payload"]) => void
>();

process.on("message", (msg: MessageToServer) => {
  const handler = messageHandlers.get(msg.requestID);
  if (handler) {
    handler(msg.payload);
    messageHandlers.delete(msg.requestID);
  }
});

const t = initTRPC.create();
const appRouter = t.router({
  capture: t.procedure
    .input(
      z.object({
        width: z.number(),
        height: z.number(),
      })
    )
    .query<MessageToServer["payload"]>(async (req) => {
      console.log(req.input);
      return await new Promise((resolve) => {
        const requestID = Math.random();
        console.log(requestID);

        const message: MessageFromServer = {
          type: "capture",
          requestID,
          payload: req.input,
        };
        console.log(process.send);
        process.send?.(message);

        messageHandlers.set(requestID, (payload) => {
          console.log(payload);
          resolve(payload);
        });
      });
    }),
});
export type AppRouter = typeof appRouter;

const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
