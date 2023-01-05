import { JSX, FunctionComponent } from "preact";
import { twMerge } from "tailwind-merge";

export function styled<T extends keyof JSX.IntrinsicElements>(
  TagName: T,
  className: string
): FunctionComponent<JSX.IntrinsicElements[T]> {
  // TODO: ref
  return (props: JSX.IntrinsicElements[T]) => {
    const newProps: JSX.IntrinsicElements[T] = {
      ...props,
      className: twMerge(
        className,
        typeof props.className === "string" ? props.className : undefined
      ),
    };
    // @ts-ignore
    return <TagName {...newProps} />;
  };
}
