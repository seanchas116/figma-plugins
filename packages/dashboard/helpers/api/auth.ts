import { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import db from "../../lib/prismadb";

export async function getGitHubToken(
  req: NextApiRequest
): Promise<string | undefined> {
  const token = await getToken({
    req,
  });
  if (!token) {
    return;
  }

  const account = await db.account.findFirst({
    where: {
      userId: token.sub,
      provider: "github",
    },
  });

  return account?.access_token ?? undefined;
}

export async function getFigmaToken(
  req: NextApiRequest
): Promise<string | undefined> {
  const token = await getToken({
    req,
  });
  if (!token) {
    return;
  }

  const account = await db.account.findFirst({
    where: {
      userId: token.sub,
      provider: "figma",
    },
  });

  return account?.access_token ?? undefined;
}
