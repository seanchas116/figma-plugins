import { createRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";

function App() {
  const [count, setCount] = useState(0);

  const ref = createRef<HTMLDivElement>();

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
