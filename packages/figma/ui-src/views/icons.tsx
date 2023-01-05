import { JSX } from "preact";

export const AutoWidthIcon = (props: JSX.IntrinsicElements["svg"]) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...props}>
      <path
        d="M2 8H14M2 8L4 10M2 8L4 6M14 8L12 6M14 8L12 10"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export const AutoHeightIcon = (props: JSX.IntrinsicElements["svg"]) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...props}>
      <path
        d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H8"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export const FixedSizeIcon = (props: JSX.IntrinsicElements["svg"]) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...props}>
      <rect
        x="2.5"
        y="2.5"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        fill="none"
      />
    </svg>
  );
};
