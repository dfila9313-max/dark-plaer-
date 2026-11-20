import { cn } from "@/lib/cn";

export type BookingStatus = "new" | "confirmed" | "completed" | "cancelled" | "no_show";

const statuses: Record<BookingStatus, { label: string; dot: string }> = {
  new: { label: "Новая", dot: "bg-warning" },
  confirmed: { label: "Подтверждена", dot: "bg-accent" },
  completed: { label: "Завершена", dot: "bg-text-secondary/60" },
  cancelled: { label: "Отменена", dot: "bg-danger" },
  no_show: { label: "Неявка", dot: "bg-text" },
};

/** Booking status as a dot and a word — never a loud coloured pill. */
export function StatusDot({ status, className }: { status: BookingStatus; className?: string }) {
  const s = statuses[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-caption text-text-secondary", className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
