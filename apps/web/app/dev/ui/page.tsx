import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { StatusDot } from "@/components/ui/StatusDot";

export const metadata = { title: "Компоненты" };

const colors = [
  ["bg", "#F7F7F5"], ["surface", "#FFFFFF"], ["surface-muted", "#F0EFEC"], ["border", "#E6E4DF"],
  ["text", "#1D1D1F"], ["text-secondary", "#6B6A66"], ["accent", "#234A6E"], ["accent-soft", "#E9EEF3"],
  ["success", "#2E7D5B"], ["warning", "#B7791F"], ["danger", "#B42318"],
];

const type = [
  ["Display", "text-display font-semibold"], ["H1", "text-h1 font-semibold"], ["H2", "text-h2 font-semibold"],
  ["H3", "text-h3 font-semibold"], ["Body", "text-body"], ["Small", "text-small"], ["Caption", "text-caption font-medium"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-2 text-h2 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** Internal showcase of the design system. Not available in production. */
export default function UiShowcase() {
  if (process.env.NODE_ENV === "production" && process.env.ADMINO_SHOW_DEV_UI !== "1") notFound();
  return (
    <main className="mx-auto flex max-w-[1000px] flex-col gap-12 px-6 py-12">
      <h1 className="text-h1 font-semibold">Дизайн-система ADMINO</h1>
      <Section title="Цвета">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {colors.map(([name, hex]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="size-10 rounded-sm border border-border" style={{ background: hex }} />
              <span className="flex flex-col">
                <span className="text-small font-medium">{name}</span>
                <span className="tabular text-caption text-text-secondary">{hex}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Типографика">
        {type.map(([name, cls]) => (
          <div key={name} className="flex items-baseline gap-6">
            <span className="w-20 shrink-0 text-caption text-text-secondary">{name}</span>
            <span className={cls}>Запись к мастеру</span>
          </div>
        ))}
      </Section>
      <Section title="Кнопки">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Основная</Button>
          <Button variant="secondary">Вторичная</Button>
          <Button variant="ghost">Тихая</Button>
          <Button variant="danger">Удалить</Button>
          <Button disabled>Недоступна</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Маленькая</Button>
          <Button size="md">Средняя</Button>
          <Button size="lg">Большая</Button>
        </div>
      </Section>
      <Section title="Поля">
        <div className="grid max-w-[640px] gap-4 sm:grid-cols-2">
          <Field label="Имя" placeholder="Как к вам обращаться" />
          <Field label="Телефон" type="tel" placeholder="+7 900 000-00-00" hint="Пришлём подтверждение записи" />
          <Field label="Email" type="email" defaultValue="owner@" error="Проверьте адрес почты" />
        </div>
      </Section>
      <Section title="Статусы, счётчики, аватары">
        <div className="flex flex-wrap items-center gap-6">
          <StatusDot status="new" />
          <StatusDot status="confirmed" />
          <StatusDot status="completed" />
          <StatusDot status="cancelled" />
          <StatusDot status="no_show" />
          <Badge count={3} />
          <Avatar name="Артём Соколов" />
          <Avatar name="Илья" size={40} />
        </div>
      </Section>
      <Section title="Карточка">
        <Card className="max-w-[360px] p-5">
          <div className="flex justify-between">
            <span className="flex flex-col">
              <span className="text-[14px] font-semibold">Павел Т.</span>
              <span className="text-small text-text-secondary">Мужская стрижка · Илья</span>
            </span>
            <span className="tabular text-[14px] font-semibold">12:30</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="flex-1">Подтвердить</Button>
            <Button size="sm" variant="secondary" className="flex-1">Перенести</Button>
          </div>
        </Card>
      </Section>
    </main>
  );
}
