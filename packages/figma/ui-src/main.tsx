import { App } from "./views/App";
import "./main.css";
import { render } from "preact";

const root = document.getElementById("root")!;
render(<App />, root);
