import express from "express";
import cors from "cors";
import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { z } from "zod";

const t = initTRPC.create();
const appRouter = t.router({
  capture: t.procedure
    .input(
      z.object({
        width: z.number(),
        height: z.number(),
      })
    )
    .query((req) => {
      console.log(req.input);
      return {
        width: req.input.width,
        height: req.input.height,
      };
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
