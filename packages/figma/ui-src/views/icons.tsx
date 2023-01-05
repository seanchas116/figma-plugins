import { JSX } from "preact";

export const AutoWidthIcon = (props: JSX.IntrinsicElements["svg"]) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...props}>
      <path
        d="M2 8H14M2 8L4 10M2 8L4 6M14 8L12 6M14 8L12 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        strokeLinecap="round"
        strokeLinejoin="round"
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

export const MenuIcon = (props: JSX.IntrinsicElements["svg"]) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M4.5 8C4.5 8.13261 4.44732 8.25978 4.35355 8.35355C4.25979 8.44732 4.13261 8.5 4 8.5C3.86739 8.5 3.74021 8.44732 3.64645 8.35355C3.55268 8.25978 3.5 8.13261 3.5 8C3.5 7.86739 3.55268 7.74022 3.64645 7.64645C3.74021 7.55268 3.86739 7.5 4 7.5C4.13261 7.5 4.25979 7.55268 4.35355 7.64645C4.44732 7.74022 4.5 7.86739 4.5 8ZM8.5 8C8.5 8.13261 8.44732 8.25978 8.35355 8.35355C8.25979 8.44732 8.13261 8.5 8 8.5C7.86739 8.5 7.74022 8.44732 7.64645 8.35355C7.55268 8.25978 7.5 8.13261 7.5 8C7.5 7.86739 7.55268 7.74022 7.64645 7.64645C7.74022 7.55268 7.86739 7.5 8 7.5C8.13261 7.5 8.25979 7.55268 8.35355 7.64645C8.44732 7.74022 8.5 7.86739 8.5 8ZM12.5 8C12.5 8.13261 12.4473 8.25978 12.3536 8.35355C12.2598 8.44732 12.1326 8.5 12 8.5C11.8674 8.5 11.7402 8.44732 11.6464 8.35355C11.5527 8.25978 11.5 8.13261 11.5 8C11.5 7.86739 11.5527 7.74022 11.6464 7.64645C11.7402 7.55268 11.8674 7.5 12 7.5C12.1326 7.5 12.2598 7.55268 12.3536 7.64645C12.4473 7.74022 12.5 7.86739 12.5 8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const CloseIcon = (props: JSX.IntrinsicElements["svg"]) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M4 12L12 4M4 4L12 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ChevronDownIcon = (props: JSX.IntrinsicElements["svg"]) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M13 5.5L8 10.5L3 5.5"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
