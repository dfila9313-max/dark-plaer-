import { DayPreview } from "@/components/marketing/DayPreview";
import { ButtonLink } from "@/components/ui/Button";

const steps = [
  { title: "Добавьте услуги и мастеров", text: "Цены, длительность, кто что делает. Мастеров можно пригласить по ссылке." },
  { title: "Настройте график", text: "Рабочие дни, перерывы и выходные — у каждого мастера свои." },
  { title: "Поделитесь ссылкой", text: "Клиенты записываются сами на вашей странице. Без звонков и переписки." },
];

const features = [
  { title: "Запись без накладок", text: "Два клиента не попадут на одно время, даже если нажмут «Записаться» одновременно." },
  { title: "Своя страница салона", text: "Услуги, цены, мастера, фото и онлайн-запись — по короткой ссылке с названием салона." },
  { title: "Расписание по мастерам", text: "Лента дня и неделя, свободные окна считаются с учётом длительности услуги." },
  { title: "Роли и доступы", text: "Владелец, управляющий, администратор и мастер видят только то, что им нужно." },
  { title: "Чат команды", text: "Переписка сотрудников внутри салона, со статусом прочтения." },
  { title: "Работает с телефона", text: "Мастер видит свои записи в телефоне, клиент записывается в пару касаний." },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 pt-16 pb-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
            Для барбершопов и салонов красоты
          </p>
          <h1 className="mt-5 text-[40px] leading-[46px] font-semibold tracking-[-0.02em] md:text-display">
            Онлайн-запись, расписание и команда в одном спокойном кабинете
          </h1>
          <p className="mt-6 max-w-[48ch] text-[18px] leading-[28px] text-text-secondary">
            Клиенты записываются сами, мастера видят свой день, а вы — весь салон. Без двойных броней и таблиц.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">Создать салон</ButtonLink>
            <ButtonLink href="#how" size="lg" variant="secondary">Как это работает</ButtonLink>
          </div>
        </div>
        <DayPreview />
      </section>

      <section id="how" className="mx-auto max-w-[1200px] px-6 py-16 md:px-8">
        <h2 className="border-b border-text pb-4 text-[28px] leading-[34px] font-semibold tracking-[-0.01em] md:text-[36px] md:leading-[42px]">
          Запуск за один вечер
        </h2>
        <ol className="m-0 grid list-none gap-8 p-0 pt-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3">
              <span className="tabular text-[40px] leading-none font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h2 font-semibold">{s.title}</h3>
              <p className="text-text-secondary">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="features" className="mx-auto max-w-[1200px] px-6 py-16 md:px-8">
        <h2 className="border-b border-text pb-4 text-[28px] leading-[34px] font-semibold tracking-[-0.01em] md:text-[36px] md:leading-[42px]">
          Что внутри
        </h2>
        <div className="grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="border-b border-border py-6">
              <h3 className="text-h3 font-semibold">{f.title}</h3>
              <p className="mt-2 text-text-secondary">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pt-8 pb-20 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg bg-accent px-8 py-10 text-on-accent md:flex-row md:items-center">
          <div>
            <h2 className="text-[28px] leading-[34px] font-semibold">Попробуйте на своём салоне</h2>
            <p className="mt-2 text-on-accent/80">Пробный период — без оплаты и без привязки карты.</p>
          </div>
          <ButtonLink href="/register" size="lg" variant="secondary" className="border-transparent">
            Создать салон
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
