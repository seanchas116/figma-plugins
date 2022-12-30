// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { renderTrpcPanel } from "trpc-panel";
import { appRouter } from "../../server/routers/_app";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const result = renderTrpcPanel(appRouter, {
    url: "http://localhost:3000/api/trpc",
  });
  res.status(200);
  res.write(result);
  res.end();
}
