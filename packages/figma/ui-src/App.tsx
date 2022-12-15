import { RenderIFrame } from "./RenderIFrame";
import { postMessageToPlugin } from "./common";

export const App: React.FC = () => {
  const handleClick = () => {
    postMessageToPlugin({
      type: "updateComponent",
      payload: {
        name: "Button",
        props: {},
      },
    });
  };

  return (
    <div className="p-2 flex flex-col gap-2 text-xs">
      <select className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <option value="">Not Attached</option>
        <option value="Button">Button</option>
        <option value="Checkbox">Checkbox</option>
        <option value="TextField">TextField</option>
      </select>
      <dl className="flex flex-col gap-1">
        <dt className="text-gray-500">Primary</dt>
        <dd>
          <input className="accent-indigo-500" type="checkbox" />
        </dd>
        <dt className="text-gray-500">Label</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            type="text"
          />
        </dd>
      </dl>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
      >
        Attach
      </button>
      <RenderIFrame />
    </div>
  );
};
