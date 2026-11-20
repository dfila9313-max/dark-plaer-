import { cn } from "@/lib/cn";

/** Small counter, e.g. unread messages. */
export function Badge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-caption font-semibold text-on-accent tabular",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
