import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { rpc } from "../rpc";

// Based on https://gist.github.com/sonnylazuardi/e55300f28fbe109db052f6568fee5a04

export const Resizer: FunctionComponent = () => {
  const [dragging, setDragging] = useState(false);

  const resizeWindow = (e: PointerEvent) => {
    const size = {
      width: Math.max(50, Math.floor(e.clientX + 5)),
      height: Math.max(50, Math.floor(e.clientY + 5)),
    };
    rpc.remote.resize(size.width, size.height);
  };

  return (
    <svg
      className="fixed z-50 bottom-0 right-0 cursor-nwse-resize"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onPointerDown={(e) => {
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={dragging ? resizeWindow : undefined}
      onPointerUp={(e) => {
        setDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
    >
      <path d="M16 0V16H0L16 0Z" fill="white" />
      <path d="M6.22577 16H3L16 3V6.22576L6.22577 16Z" fill="#8C8C8C" />
      <path
        d="M11.8602 16H8.63441L16 8.63441V11.8602L11.8602 16Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};
