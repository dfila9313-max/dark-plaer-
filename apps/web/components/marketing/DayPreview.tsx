import { Avatar } from "@/components/ui/Avatar";
import { StatusDot, type BookingStatus } from "@/components/ui/StatusDot";
import { cn } from "@/lib/cn";

// Illustrative product preview for the landing page (labelled as an example).
const HOUR = 48;
const START = 10;

type Item = { from: number; to: number; client: string; service: string; status: BookingStatus };
const columns: { master: string; items: Item[] }[] = [
  { master: "Артём", items: [
    { from: 10, to: 11, client: "Денис К.", service: "Мужская стрижка", status: "completed" },
    { from: 11.5, to: 12.5, client: "Олег В.", service: "Стрижка + борода", status: "confirmed" },
    { from: 13, to: 14, client: "Иван П.", service: "Мужская стрижка", status: "confirmed" },
  ] },
  { master: "Илья", items: [
    { from: 10.5, to: 11.5, client: "Никита Р.", service: "Стрижка машинкой", status: "completed" },
    { from: 12.5, to: 13.5, client: "Павел Т.", service: "Мужская стрижка", status: "new" },
  ] },
  { master: "Марк", items: [
    { from: 12, to: 13, client: "Глеб Н.", service: "Мужская стрижка", status: "confirmed" },
    { from: 13.5, to: 14.5, client: "Тимур А.", service: "Отец и сын", status: "new" },
  ] },
];

const tone: Record<BookingStatus, string> = {
  completed: "bg-surface-muted text-text-secondary border-surface-muted",
  confirmed: "bg-accent-soft border-accent-soft",
  new: "bg-surface border-warning border-dashed",
  cancelled: "bg-surface border-border",
  no_show: "bg-surface border-border",
};

export function DayPreview() {
  const hours = [10, 11, 12, 13, 14];
  const now = 12 + 10 / 60;
  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-popover)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-small font-semibold">Сегодня</span>
          <span className="text-caption text-text-secondary">Пятница, 20 ноября</span>
        </div>
        <div className="grid grid-cols-[44px_repeat(3,minmax(0,1fr))] border-b border-border">
          <span />
          {columns.map((c) => (
            <span key={c.master} className="flex items-center gap-2 border-l border-border px-2.5 py-2 text-caption font-semibold">
              <Avatar name={c.master} size={22} />
              {c.master}
            </span>
          ))}
        </div>
        <div className="relative grid grid-cols-[44px_repeat(3,minmax(0,1fr))]" style={{ height: HOUR * 4.6 }}>
          <div className="relative">
            {hours.map((h, i) => (
              <span key={h} className="tabular absolute right-2 text-caption text-text-secondary" style={{ top: i * HOUR + (i === 0 ? 2 : -7) }}>
                {h}:00
              </span>
            ))}
          </div>
          {columns.map((c) => (
            <div
              key={c.master}
              className="relative border-l border-border"
              style={{ backgroundImage: "linear-gradient(#EFEDE8 1px, transparent 1px)", backgroundSize: `100% ${HOUR}px` }}
            >
              {c.items.map((it) => (
                <div
                  key={it.client}
                  className={cn("absolute inset-x-1 z-10 flex flex-col overflow-hidden rounded-[8px] border px-2 py-1", tone[it.status])}
                  style={{ top: (it.from - START) * HOUR + 2, height: (it.to - it.from) * HOUR - 4 }}
                >
                  <span className="truncate text-caption font-semibold">{it.client}</span>
                  <StatusDot status={it.status} className="truncate text-[11px]" />
                </div>
              ))}
            </div>
          ))}
          <div aria-hidden="true" className="absolute right-0 left-[40px] z-[5] border-t-2 border-accent" style={{ top: (now - START) * HOUR }}>
            <span className="absolute -top-[6px] -left-1 size-2.5 rounded-full bg-accent" />
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-caption text-text-secondary">Пример экрана «Сегодня» в кабинете салона</figcaption>
    </figure>
  );
}
