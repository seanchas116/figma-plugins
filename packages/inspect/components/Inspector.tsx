import { useState } from "react";

export const Inspector: React.FC = () => {
  const [data, setData] = useState("TODO");

  return (
    <section>
      <h1 className="text-2xl font-bold">Inspector</h1>
      <dl>
        <dt>Figma Access Token</dt>
        <dd>
          <input className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </dd>
        <dt>File URL</dt>
        <dd>
          <input className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </dd>
      </dl>
      <pre>{data}</pre>
    </section>
  );
};
