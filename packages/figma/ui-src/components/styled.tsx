import React from "react";
import { twMerge } from "tailwind-merge";

export function styled<T extends keyof JSX.IntrinsicElements>(
  TagName: T,
  className: string
): React.FC<JSX.IntrinsicElements[T]> {
  return React.forwardRef((props: JSX.IntrinsicElements[T], ref) => {
    const newProps: JSX.IntrinsicElements[T] = {
      ...props,
      className: twMerge(
        className,
        typeof props.className === "string" ? props.className : undefined
      ),
      ref,
    };
    // @ts-ignore
    return <TagName {...newProps} />;
  });
}
