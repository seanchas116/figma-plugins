import { assets } from "./designSystem";

function App() {
  return (
    <main className="p-2 text-gray-900">
      <section className="p-4">
        <h2 className="text-xl mb-2">Color Styles</h2>
        <ul>
          {Object.entries(assets.colorStyles).map(([name, data]) => (
            <li key={name} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full shadow"
                style={{ backgroundColor: data.value }}
              />
              <div>
                <div>{name}</div>
                <div className="text-gray-500">{data.value}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="p-4">
        <h2 className="text-xl mb-2">Text Styles</h2>
        <ul className="flex flex-col gap-1">
          {Object.entries(assets.textStyles).map(([name, data]) => (
            <li key={name} className="flex flex-col">
              <div>{name}</div>
              <div
                style={{
                  fontFamily: data.value.fontFamily,
                  fontSize: data.value.fontSize + "px",
                  fontWeight: data.value.fontWeight,
                  lineHeight:
                    data.value.lineHeight &&
                    Math.round(data.value.lineHeight * 100) + "%",
                  letterSpacing:
                    data.value.letterSpacing &&
                    Math.round(data.value.letterSpacing * 100) + "%",
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="p-4">
        <h2 className="text-xl mb-2">Components</h2>
        <ul className="flex flex-wrap gap-2">
          {assets.components.map((component) => (
            <li>
              <div className="mb-2">
                <div>{component.displayName}</div>
                <div className="text-gray-500">{component.filePath}</div>
              </div>
              <div className="w-60 h-60 shadow"></div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
