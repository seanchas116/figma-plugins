import { Props } from "react-docgen-typescript";
import { Assets, ColorStyleData, TextStyleData } from "../../../figma/data";
import components from "./components.json";

export const colorStyles: Record<string, ColorStyleData> = {
  background: {
    value: "#fff",
    comment: "The background color of the app",
  },
  text: {
    value: "#333",
    comment: "The text color of the app",
  },
  primary: {
    value: "#1ea7fd",
    comment: "The primary color of the app",
  },
  border: {
    value: "rgba(0, 0, 0, 0.15)",
    comment: "The border color of the app",
  },
};

export const textStyles: Record<string, TextStyleData> = {
  heading: {
    value: {
      fontFamily: "Noto Sans",
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.25,
    },
    comment: "The heading text style of the app",
  },
  body: {
    value: {
      fontFamily: "Noto Sans",
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    comment: "The body text style of the app",
  },
  small: {
    value: {
      fontFamily: "Noto Sans",
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    comment: "The small text style of the app",
  },
};

export const assets: Assets = {
  components: components.map((component) => ({
    name: component.displayName,
    path: component.filePath,
    props: component.props as any as Props,
  })),
  colorStyles,
  textStyles,
};
