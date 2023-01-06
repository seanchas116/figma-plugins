import { ChevronDownIcon } from "./Icon";
import { styled } from "./styled";
import { JSX, ComponentChildren } from "preact";
import { twMerge } from "tailwind-merge";

export const Input = styled(
  "input",
  "w-full p-1 -m-1 outline outline-1 outline-transparent hover:outline-gray-300 focus:outline-blue-500 placeholder:text-gray-300"
);

export function Select({
  className,
  value,
  onChange,
  children,
}: {
  className?: string;
  value: string;
  onChange: (event: JSX.TargetedEvent<HTMLSelectElement>) => void;
  children: ComponentChildren;
}) {
  return (
    <div className={twMerge("relative w-fit", className)}>
      <select
        className="appearance-none pr-5 p-1 -m-1 outline outline-1 outline-transparent hover:outline-gray-300 focus:outline-blue-500 placeholder:text-gray-400"
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <ChevronDownIcon
        width={12}
        height={12}
        className="pointer-events-none absolute right-0 top-0 bottom-0 my-auto"
      />
    </div>
  );
}
