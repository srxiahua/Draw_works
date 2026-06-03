import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-0.5 text-xs text-violet-200",
        className
      )}
      {...props}
    />
  );
}
