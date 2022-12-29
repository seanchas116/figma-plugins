import { NextApiRequest, NextApiResponse } from "next";
import { getFigmaToken } from "../../../helpers/api/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accessToken = await getFigmaToken(req);

  console.log(req.query.id);

  const fetchRes = await fetch(
    "https://api.figma.com/v1/files/" + req.query.id,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const json = await fetchRes.json();
  console.log(json);

  res.json(json);
}
