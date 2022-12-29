import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";
import { z } from "zod";
import { getGitHubToken } from "../../../helpers/api/auth";

const Query = z.object({
  owner: z.string(),
  repo: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queryParsed = Query.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }
  const query = queryParsed.data;

  const accessToken = await getGitHubToken(req);
  if (!accessToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const octokit = new Octokit({ auth: accessToken });
  const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: query.owner,
    repo: query.repo,
  });
  res.json(result.data);
}
