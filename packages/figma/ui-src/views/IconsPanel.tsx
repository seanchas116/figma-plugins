import { Icon } from "@iconify/react";
import { createRef, useEffect, useState } from "react";
import { iconData } from "../state/IconData";
import type { IconifyInfo, ExtendedIconifyIcon } from "@iconify/types";
import { observer } from "mobx-react-lite";

const SearchInput: React.FC = () => {
  return (
    <div className="relative h-10 border-b border-gray-200">
      <input
        type="text"
        placeholder="Search Collection"
        className="absolute inset-0 px-4 py-3 pl-10 placeholder:text-gray-300 outline-none font-medium text-gray-900"
        autoFocus
      />
      <Icon
        icon="material-symbols:search"
        className="text-base absolute left-4 top-3 text-gray-300"
      />
    </div>
  );
};

const AllIconCard: React.FC<{
  iconCount: number;
  onClick: () => void;
}> = ({ iconCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col p-2 justify-between h-12 border-gray-200 rounded border text-start hover:bg-gray-50"
    >
      <div className="font-semibold text-black">All</div>
      <div className="font-medium text-gray-500">{iconCount} Icons</div>
    </button>
  );
};

// WIP
const IconCollectionCard: React.FC<{
  info: IconifyInfo;
  onClick: () => void;
}> = ({ info, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex p-2 justify-between border-gray-200 rounded border hover:bg-gray-50"
      style={{
        contentVisibility: "auto",
        // @ts-ignore
        containIntrinsicSize: "72px",
      }}
    >
      <div className="flex flex-col self-stretch text-start">
        <div className="font-semibold text-black">{info.name}</div>
        <div className="font-medium text-gray-500">{info.author.name}</div>
        <div className="font-medium text-gray-500 mt-auto">
          {info.total} Icons
        </div>
      </div>
      <div className="flex fit flex-col gap-1 items-start">
        <div className="flex relative w-fit gap-1 items-start">
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={12}
              height={12}
              viewBox={"0 0 12 12"}
              fill={"none"}
              className="flex absolute left-0.5 top-0.5 w-3 h-3"
            >
              <path
                d="M2 8H3V4H1.33333V5H2V8ZM4.33333 8H6C6.18889 8 6.34733 7.936 6.47533 7.808C6.60289 7.68044 6.66667 7.52222 6.66667 7.33333V4.66667C6.66667 4.47778 6.60289 4.31933 6.47533 4.19133C6.34733 4.06378 6.18889 4 6 4H4.33333C4.14444 4 3.98622 4.06378 3.85867 4.19133C3.73067 4.31933 3.66667 4.47778 3.66667 4.66667V7.33333C3.66667 7.52222 3.73067 7.68044 3.85867 7.808C3.98622 7.936 4.14444 8 4.33333 8ZM4.66667 7V5H5.66667V7H4.66667ZM7.28333 8H8.28333V6.5L9.45 8H10.6667L9.11667 6L10.6667 4H9.45L8.28333 5.5V4H7.28333V8ZM1.33333 12C0.966667 12 0.652667 11.8696 0.391333 11.6087C0.130444 11.3473 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130444 0.652667 0.391333 0.391333C0.652667 0.130444 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3473 0.130444 11.6087 0.391333C11.8696 0.652667 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8696 11.3473 11.6087 11.6087C11.3473 11.8696 11.0333 12 10.6667 12H1.33333ZM1.33333 10.6667H10.6667V1.33333H1.33333V10.6667Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={12}
              height={12}
              viewBox={"0 0 12 12"}
              fill={"none"}
              className="flex absolute left-0.5 top-0.5 w-3 h-3"
            >
              <path
                d="M3.66667 5.66667H4.66667V1.66667H2.66667V2.66667H3.66667V5.66667ZM6.66667 5.66667H8.33333C8.52222 5.66667 8.68044 5.60267 8.808 5.47467C8.936 5.34711 9 5.18889 9 5V2.33333C9 2.14444 8.936 1.986 8.808 1.858C8.68044 1.73044 8.52222 1.66667 8.33333 1.66667H6.66667C6.47778 1.66667 6.31956 1.73044 6.192 1.858C6.064 1.986 6 2.14444 6 2.33333V5C6 5.18889 6.064 5.34711 6.192 5.47467C6.31956 5.60267 6.47778 5.66667 6.66667 5.66667ZM7 4.66667V2.66667H8V4.66667H7ZM2 10.3333H3V7.33333H3.66667V9.33333H4.66667V7.33333H5.33333V10.3333H6.33333V7C6.33333 6.81111 6.26956 6.65267 6.142 6.52467C6.014 6.39711 5.85556 6.33333 5.66667 6.33333H2.66667C2.47778 6.33333 2.31933 6.39711 2.19133 6.52467C2.06378 6.65267 2 6.81111 2 7V10.3333ZM7 10.3333H8V9.33333H9.33333C9.52222 9.33333 9.68044 9.26933 9.808 9.14133C9.936 9.01378 10 8.85556 10 8.66667V7C10 6.81111 9.936 6.65267 9.808 6.52467C9.68044 6.39711 9.52222 6.33333 9.33333 6.33333H7V10.3333ZM8 8.33333V7.33333H9V8.33333H8ZM1.33333 12C0.966667 12 0.652667 11.8696 0.391333 11.6087C0.130444 11.3473 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130444 0.652667 0.391333 0.391333C0.652667 0.130444 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3473 0.130444 11.6087 0.391333C11.8696 0.652667 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8696 11.3473 11.6087 11.6087C11.3473 11.8696 11.0333 12 10.6667 12H1.33333ZM1.33333 10.6667H10.6667V1.33333H1.33333V10.6667Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={12}
              height={12}
              viewBox={"0 0 12 12"}
              fill={"none"}
              className="flex absolute left-0.5 top-0.5 w-3 h-3"
            >
              <path
                d="M4.33333 5.66667H5.33333V1.66667H3.33333V2.66667H4.33333V5.66667ZM7.66667 5.66667H8.66667V1.66667H6.66667V2.66667H7.66667V5.66667ZM2 10.3333H3V7.33333H3.66667V9.33333H4.66667V7.33333H5.33333V10.3333H6.33333V7C6.33333 6.81111 6.26956 6.65267 6.142 6.52467C6.014 6.39711 5.85556 6.33333 5.66667 6.33333H2.66667C2.47778 6.33333 2.31933 6.39711 2.19133 6.52467C2.06378 6.65267 2 6.81111 2 7V10.3333ZM7 10.3333H8V9.33333H9.33333C9.52222 9.33333 9.68044 9.26933 9.808 9.14133C9.936 9.01378 10 8.85556 10 8.66667V7C10 6.81111 9.936 6.65267 9.808 6.52467C9.68044 6.39711 9.52222 6.33333 9.33333 6.33333H7V10.3333ZM8 8.33333V7.33333H9V8.33333H8ZM1.33333 12C0.966667 12 0.652667 11.8696 0.391333 11.6087C0.130444 11.3473 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130444 0.652667 0.391333 0.391333C0.652667 0.130444 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3473 0.130444 11.6087 0.391333C11.8696 0.652667 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8696 11.3473 11.6087 11.6087C11.3473 11.8696 11.0333 12 10.6667 12H1.33333ZM1.33333 10.6667H10.6667V1.33333H1.33333V10.6667Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
        </div>
        <div className="flex relative w-fit gap-1 items-start">
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={11}
              height={4}
              viewBox={"0 0 11 4"}
              fill={"none"}
              className="flex absolute left-[0.1666666716337204rem] top-1.5 w-[0.6458333134651184rem] h-1"
            >
              <path
                d="M1.66663 4V1H0.666626V0H2.66663V4H1.66663ZM3.99996 4V2.33333C3.99996 2.14444 4.06396 1.986 4.19196 1.858C4.31951 1.73044 4.47774 1.66667 4.66663 1.66667H5.99996V1H3.99996V0H6.33329C6.52218 0 6.68063 0.0637776 6.80863 0.191333C6.93618 0.319333 6.99996 0.477778 6.99996 0.666667V1.66667C6.99996 1.85556 6.93618 2.01378 6.80863 2.14133C6.68063 2.26933 6.52218 2.33333 6.33329 2.33333H4.99996V3H6.99996V4H3.99996ZM7.99996 4V3H9.99996V2.33333H8.66663V1.66667H9.99996V1H7.99996V0H10.3333C10.5222 0 10.6804 0.0637776 10.808 0.191333C10.936 0.319333 11 0.477778 11 0.666667V3.33333C11 3.52222 10.936 3.68044 10.808 3.808C10.6804 3.936 10.5222 4 10.3333 4H7.99996Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={12}
              height={12}
              viewBox={"0 0 12 12"}
              fill={"none"}
              className="flex absolute left-0.5 top-0.5 w-3 h-3"
            >
              <path
                d="M3.66667 5.66667H4.66667V1.66667H2.66667V2.66667H3.66667V5.66667ZM6 5.66667H9V4.66667H7V4H8.33333C8.52222 4 8.68044 3.936 8.808 3.808C8.936 3.68044 9 3.52222 9 3.33333V2.33333C9 2.14444 8.936 1.986 8.808 1.858C8.68044 1.73044 8.52222 1.66667 8.33333 1.66667H6V2.66667H8V3.33333H6.66667C6.47778 3.33333 6.31956 3.39711 6.192 3.52467C6.064 3.65267 6 3.81111 6 4V5.66667ZM2 10.3333H3V7.33333H3.66667V9.33333H4.66667V7.33333H5.33333V10.3333H6.33333V7C6.33333 6.81111 6.26956 6.65267 6.142 6.52467C6.014 6.39711 5.85556 6.33333 5.66667 6.33333H2.66667C2.47778 6.33333 2.31933 6.39711 2.19133 6.52467C2.06378 6.65267 2 6.81111 2 7V10.3333ZM7 10.3333H8V9.33333H9.33333C9.52222 9.33333 9.68044 9.26933 9.808 9.14133C9.936 9.01378 10 8.85556 10 8.66667V7C10 6.81111 9.936 6.65267 9.808 6.52467C9.68044 6.39711 9.52222 6.33333 9.33333 6.33333H7V10.3333ZM8 8.33333V7.33333H9V8.33333H8ZM1.33333 12C0.966667 12 0.652667 11.8696 0.391333 11.6087C0.130444 11.3473 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130444 0.652667 0.391333 0.391333C0.652667 0.130444 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3473 0.130444 11.6087 0.391333C11.8696 0.652667 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8696 11.3473 11.6087 11.6087C11.3473 11.8696 11.0333 12 10.6667 12H1.33333ZM1.33333 10.6667H10.6667V1.33333H1.33333V10.6667Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={12}
              height={12}
              viewBox={"0 0 12 12"}
              fill={"none"}
              className="flex absolute left-0.5 top-0.5 w-3 h-3"
            >
              <path
                d="M3.66667 5.66667H4.66667V1.66667H2.66667V2.66667H3.66667V5.66667ZM6 5.66667H8.33333C8.52222 5.66667 8.68044 5.60267 8.808 5.47467C8.936 5.34711 9 5.18889 9 5V2.33333C9 2.14444 8.936 1.986 8.808 1.858C8.68044 1.73044 8.52222 1.66667 8.33333 1.66667H6V2.66667H8V3.33333H6.66667V4H8V4.66667H6V5.66667ZM2 10.3333H3V7.33333H3.66667V9.33333H4.66667V7.33333H5.33333V10.3333H6.33333V7C6.33333 6.81111 6.26956 6.65267 6.142 6.52467C6.014 6.39711 5.85556 6.33333 5.66667 6.33333H2.66667C2.47778 6.33333 2.31933 6.39711 2.19133 6.52467C2.06378 6.65267 2 6.81111 2 7V10.3333ZM7 10.3333H8V9.33333H9.33333C9.52222 9.33333 9.68044 9.26933 9.808 9.14133C9.936 9.01378 10 8.85556 10 8.66667V7C10 6.81111 9.936 6.65267 9.808 6.52467C9.68044 6.39711 9.52222 6.33333 9.33333 6.33333H7V10.3333ZM8 8.33333V7.33333H9V8.33333H8ZM1.33333 12C0.966667 12 0.652667 11.8696 0.391333 11.6087C0.130444 11.3473 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130444 0.652667 0.391333 0.391333C0.652667 0.130444 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3473 0.130444 11.6087 0.391333C11.8696 0.652667 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8696 11.3473 11.6087 11.6087C11.3473 11.8696 11.0333 12 10.6667 12H1.33333ZM1.33333 10.6667H10.6667V1.33333H1.33333V10.6667Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
        </div>
        <div className="flex relative w-fit gap-1 items-start">
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={11}
              height={4}
              viewBox={"0 0 11 4"}
              fill={"none"}
              className="flex absolute left-[0.1666666716337204rem] top-1.5 w-[0.6458333134651184rem] h-1"
            >
              <path
                d="M1.66663 4V1H0.666626V0H2.66663V4H1.66663ZM3.99996 4V2.33333C3.99996 2.14444 4.06396 1.986 4.19196 1.858C4.31951 1.73044 4.47774 1.66667 4.66663 1.66667H5.99996V1H3.99996V0H6.33329C6.52218 0 6.68063 0.0637776 6.80863 0.191333C6.93618 0.319333 6.99996 0.477778 6.99996 0.666667V1.66667C6.99996 1.85556 6.93618 2.01378 6.80863 2.14133C6.68063 2.26933 6.52218 2.33333 6.33329 2.33333H4.99996V3H6.99996V4H3.99996ZM7.99996 4V3H9.99996V2.33333H8.66663V1.66667H9.99996V1H7.99996V0H10.3333C10.5222 0 10.6804 0.0637776 10.808 0.191333C10.936 0.319333 11 0.477778 11 0.666667V3.33333C11 3.52222 10.936 3.68044 10.808 3.808C10.6804 3.936 10.5222 4 10.3333 4H7.99996Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={12}
              height={12}
              viewBox={"0 0 12 12"}
              fill={"none"}
              className="flex absolute left-0.5 top-0.5 w-3 h-3"
            >
              <path
                d="M3.66667 5.66667H4.66667V1.66667H2.66667V2.66667H3.66667V5.66667ZM6 5.66667H9V4.66667H7V4H8.33333C8.52222 4 8.68044 3.936 8.808 3.808C8.936 3.68044 9 3.52222 9 3.33333V2.33333C9 2.14444 8.936 1.986 8.808 1.858C8.68044 1.73044 8.52222 1.66667 8.33333 1.66667H6V2.66667H8V3.33333H6.66667C6.47778 3.33333 6.31956 3.39711 6.192 3.52467C6.064 3.65267 6 3.81111 6 4V5.66667ZM2 10.3333H3V7.33333H3.66667V9.33333H4.66667V7.33333H5.33333V10.3333H6.33333V7C6.33333 6.81111 6.26956 6.65267 6.142 6.52467C6.014 6.39711 5.85556 6.33333 5.66667 6.33333H2.66667C2.47778 6.33333 2.31933 6.39711 2.19133 6.52467C2.06378 6.65267 2 6.81111 2 7V10.3333ZM7 10.3333H8V9.33333H9.33333C9.52222 9.33333 9.68044 9.26933 9.808 9.14133C9.936 9.01378 10 8.85556 10 8.66667V7C10 6.81111 9.936 6.65267 9.808 6.52467C9.68044 6.39711 9.52222 6.33333 9.33333 6.33333H7V10.3333ZM8 8.33333V7.33333H9V8.33333H8ZM1.33333 12C0.966667 12 0.652667 11.8696 0.391333 11.6087C0.130444 11.3473 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130444 0.652667 0.391333 0.391333C0.652667 0.130444 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3473 0.130444 11.6087 0.391333C11.8696 0.652667 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8696 11.3473 11.6087 11.6087C11.3473 11.8696 11.0333 12 10.6667 12H1.33333ZM1.33333 10.6667H10.6667V1.33333H1.33333V10.6667Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
          <div className="flex relative w-4 h-4 items-start">
            <svg
              width={12}
              height={12}
              viewBox={"0 0 12 12"}
              fill={"none"}
              className="flex absolute left-0.5 top-0.5 w-3 h-3"
            >
              <path
                d="M3.66667 5.66667H4.66667V1.66667H2.66667V2.66667H3.66667V5.66667ZM6 5.66667H8.33333C8.52222 5.66667 8.68044 5.60267 8.808 5.47467C8.936 5.34711 9 5.18889 9 5V2.33333C9 2.14444 8.936 1.986 8.808 1.858C8.68044 1.73044 8.52222 1.66667 8.33333 1.66667H6V2.66667H8V3.33333H6.66667V4H8V4.66667H6V5.66667ZM2 10.3333H3V7.33333H3.66667V9.33333H4.66667V7.33333H5.33333V10.3333H6.33333V7C6.33333 6.81111 6.26956 6.65267 6.142 6.52467C6.014 6.39711 5.85556 6.33333 5.66667 6.33333H2.66667C2.47778 6.33333 2.31933 6.39711 2.19133 6.52467C2.06378 6.65267 2 6.81111 2 7V10.3333ZM7 10.3333H8V9.33333H9.33333C9.52222 9.33333 9.68044 9.26933 9.808 9.14133C9.936 9.01378 10 8.85556 10 8.66667V7C10 6.81111 9.936 6.65267 9.808 6.52467C9.68044 6.39711 9.52222 6.33333 9.33333 6.33333H7V10.3333ZM8 8.33333V7.33333H9V8.33333H8ZM1.33333 12C0.966667 12 0.652667 11.8696 0.391333 11.6087C0.130444 11.3473 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130444 0.652667 0.391333 0.391333C0.652667 0.130444 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3473 0.130444 11.6087 0.391333C11.8696 0.652667 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8696 11.3473 11.6087 11.6087C11.3473 11.8696 11.0333 12 10.6667 12H1.33333ZM1.33333 10.6667H10.6667V1.33333H1.33333V10.6667Z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
};

export const IconsPanel: React.FC = observer(() => {
  useEffect(() => {
    iconData.fetchInfos();
  }, []);

  const [prefix, setPrefix] = useState<string | undefined>(undefined);

  if (prefix) {
    return (
      <IconCollectionView prefix={prefix} onBack={() => setPrefix(undefined)} />
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      <SearchInput />
      <div className="flex-1 min-h-0 overflow-scroll px-2 py-2 flex flex-col gap-2">
        <AllIconCard
          iconCount={10000}
          onClick={() => {
            // TODO
          }}
        />
        {[...iconData.infos].map(([prefix, info]) => (
          <IconCollectionCard info={info} onClick={() => setPrefix(prefix)} />
        ))}
      </div>
    </div>
  );
});

export const IconCollectionView: React.FC<{
  prefix: string;
  onBack: () => void;
}> = observer(({ prefix, onBack }) => {
  useEffect(() => {
    iconData.fetchCollection(prefix);
  });
  const info = iconData.infos.get(prefix);
  if (!info) {
    return null;
  }
  const collection = iconData.collections.get(prefix);
  const icons = Object.entries(collection?.icons ?? {});

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex">
        <button onClick={onBack}>
          <Icon icon="material-symbols:chevron-left" className="text-base" />
        </button>
        {info.name}
      </div>
      <IconCollectionGrid icons={icons} />
    </div>
  );
});

const iconSize = 24;

type IconCollectionGridElement = {
  x: number;
  y: number;
  name: string;
  icon: ExtendedIconifyIcon;
};

const IconCollectionGrid: React.FC<{
  icons: [string, ExtendedIconifyIcon][];
}> = ({ icons }) => {
  const ref = createRef<HTMLDivElement>();

  const [height, setHeight] = useState(0);
  const [elements, setElements] = useState<IconCollectionGridElement[]>([]);

  useEffect(() => {
    const elem = ref.current;
    if (!elem) {
      return;
    }

    const onResizeOrScroll = () => {
      const width = elem.clientWidth;
      const cols = Math.floor(width / iconSize);
      const rows = Math.ceil(icons.length / cols);
      const height = rows * iconSize;

      const scrollTop = elem.scrollTop;
      const topRow = Math.floor(scrollTop / iconSize);
      const bottomRow = Math.ceil((scrollTop + elem.clientHeight) / iconSize);

      const elements: IconCollectionGridElement[] = [];

      for (let row = topRow; row < bottomRow; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * iconSize;
          const y = row * iconSize;
          const i = row * cols + col;
          const icon = icons[i];
          if (icon) {
            elements.push({
              x,
              y,
              name: icon[0],
              icon: icon[1],
            });
          }
        }
      }

      setHeight(height);
      setElements(elements);
    };

    onResizeOrScroll();
    elem.addEventListener("scroll", onResizeOrScroll);
    window.addEventListener("resize", onResizeOrScroll);
    return () => {
      elem.removeEventListener("scroll", onResizeOrScroll);
      window.removeEventListener("resize", onResizeOrScroll);
    };
  }, [icons]);

  return (
    <div
      ref={ref}
      className="flex-1 relative min-h-0 overflow-y-scroll text-base"
    >
      <div
        style={{
          width: "100%",
          height: height + "px",
        }}
      >
        {elements.map(({ x, y, name, icon }) => (
          <Icon
            icon={icon}
            style={{
              position: "absolute",
              left: x + "px",
              top: y + "px",
            }}
          />
        ))}
      </div>
    </div>
  );
};
