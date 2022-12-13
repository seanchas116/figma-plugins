import { createRef, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";

function App() {
  const [count, setCount] = useState(0);

  const ref = createRef<HTMLDivElement>();

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      console.log(event.data);

      const button = document.createElement("button");
      button.style.position = "fixed";
      button.style.top = "0";
      button.style.left = "0";
      button.innerText = "Button";
      document.body.append(button);

      const png = await (await htmlToImage.toBlob(button))?.arrayBuffer();

      button.remove();

      window.parent.postMessage(
        {
          type: "renderFinish",
          payload: png,
        },
        "*"
      );
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div className="App" ref={ref}>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          onClick={() => {
            htmlToImage.toPng(ref.current!).then(function (dataUrl) {
              download(dataUrl);
            });
          }}
        >
          Take Screenshot
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
