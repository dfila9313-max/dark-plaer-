// Temporary home page for stage 0. It has no buttons or links on purpose:
// nothing on it pretends to work. The real public site is built in stage 1.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] flex-col justify-center px-6 py-16">
      <p className="text-caption font-medium uppercase tracking-[0.12em] text-text-secondary">
        ADMINO
      </p>
      <h1 className="mt-4 text-display font-semibold tracking-tight">
        Онлайн-запись и управление салоном
      </h1>
      <p className="mt-6 max-w-[52ch] text-h3 font-normal text-text-secondary">
        Платформа для барбершопов и салонов красоты. Сейчас идёт разработка первой версии.
      </p>
    </main>
  );
}
