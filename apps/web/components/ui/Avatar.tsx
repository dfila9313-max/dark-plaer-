import { cn } from "@/lib/cn";

/** Initials avatar; photo support arrives with uploads in stage 4. */
export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-semibold text-text", className)}
    >
      {initials}
    </span>
  );
}
