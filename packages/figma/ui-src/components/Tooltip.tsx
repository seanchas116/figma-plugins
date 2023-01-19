import * as RadixTooltip from "@radix-ui/react-tooltip";

export const TooltipProvider = RadixTooltip.Provider;

export function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: React.ReactNode;
}) {
  if (!text) {
    return <>{children}</>;
  }

  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={5}
          className="pointer-events-none bg-gray-700 text-white rounded shadow text-xs px-2 py-1"
        >
          {text}
          <RadixTooltip.Arrow className="fill-gray-700" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
