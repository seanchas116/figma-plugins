import { styled } from "./styled";

export const Tabs = styled(
  "div",
  `
   flex items-center px-2 relative
   before:content-[''] before:absolute
   before:left-0 before:right-0 before:bottom-0 before:h-[1px]
   before:bg-gray-200
  `
);
export const TabItem = styled(
  "button",
  `
    font-medium text-gray-400 leading-10 px-2 relative
    hover:text-gray-600
    aria-selected:text-gray-900
    aria-selected:before:content-[''] aria-selected:before:absolute
    aria-selected:before:left-0 aria-selected:before:right-0 aria-selected:before:bottom-0 aria-selected:before:h-[2px]
    aria-selected:before:bg-blue-500
  `
);
