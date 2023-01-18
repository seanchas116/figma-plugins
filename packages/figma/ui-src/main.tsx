import { App } from "./views/App";
import "./main.css";
import { render } from "preact";
import "iconify-icon";

const root = document.getElementById("root")!;
render(<App />, root);
