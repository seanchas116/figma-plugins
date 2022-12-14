import { useEffect } from "react";
import "./App.css";
import * as htmlToImage from "html-to-image";

function App() {
  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.data.type !== "iframe:render") {
        return;
      }

      console.log(event.data);

      const button = document.createElement("button");
      button.style.position = "fixed";
      button.style.top = "0";
      button.style.left = "0";
      button.style.width = `${event.data.width}px`;
      button.style.height = `${event.data.height}px`;
      button.innerText = "Button";
      document.body.append(button);

      console.time("htmlToImage");
      const png = await (await htmlToImage.toBlob(button))?.arrayBuffer();
      console.timeEnd("htmlToImage");

      button.remove();

      window.parent.postMessage(
        {
          type: "iframe:renderFinish",
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

  return <div className="App"></div>;
}

export default App;
