import { useState } from "react";
import type { GetFileResult } from "figma-api/lib/api-types";

function fileIDFromFigmaFileURL(fileURL: string): string | undefined {
  const match = fileURL.match(/https:\/\/www.figma.com\/file\/([^\/]*)/);
  if (!match) {
    return undefined;
  }
  return match[1];
}

export const Inspector: React.FC = () => {
  const [data, setData] = useState<GetFileResult | undefined>(undefined);
  const [accessToken, setAccessToken] = useState("");
  const [fileURL, setFileURL] = useState("");

  const fetchFigma = async () => {
    const fileID = fileIDFromFigmaFileURL(fileURL);
    console.log(fileID);
    if (!fileID) {
      return;
    }
    const response = await (
      await fetch(`https://api.figma.com/v1/files/${fileID}`, {
        headers: {
          "X-Figma-Token": accessToken,
        },
      })
    ).json();
    setData(response);
  };

  return (
    <section className="flex flex-col gap-2 p-2">
      <h1 className="text-2xl font-bold">Inspector</h1>
      <dl>
        <dt>Figma Access Token</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            value={accessToken}
            onChange={(event) => setAccessToken(event.currentTarget.value)}
          />
        </dd>
        <dt>File URL</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            value={fileURL}
            onChange={(event) => setFileURL(event.currentTarget.value)}
          />
        </dd>
      </dl>
      <button
        className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-fit"
        onClick={fetchFigma}
      >
        Fetch
      </button>
      <pre
        className="
        text-xs
        bg-gray-100
        border border-gray-300
        rounded-md
        p-2
        whitespace-pre-wrap
        "
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
};
