import { useState } from "react";

function fileIDFromFigmaFileURL(fileURL: string): string | undefined {
  const match = fileURL.match(/https:\/\/www.figma.com\/file\/([^\/]*)/);
  if (!match) {
    return undefined;
  }
  return match[1];
}

export const Inspector: React.FC = () => {
  const [data, setData] = useState("TODO");
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
    ).text();
    setData(response);
  };

  return (
    <section>
      <h1 className="text-2xl font-bold">Inspector</h1>
      <dl>
        <dt>Figma Access Token</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={accessToken}
            onChange={(event) => setAccessToken(event.currentTarget.value)}
          />
        </dd>
        <dt>File URL</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={fileURL}
            onChange={(event) => setFileURL(event.currentTarget.value)}
          />
        </dd>
      </dl>
      <button
        className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        onClick={fetchFigma}
      >
        Fetch
      </button>
      <pre>{data}</pre>
    </section>
  );
};
