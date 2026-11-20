import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="ADMINO — на главную">
      <span className="flex size-7 items-center justify-center rounded-[8px] bg-accent text-[14px] font-bold text-on-accent">
        A
      </span>
      <span className="text-[15px] font-semibold tracking-[0.04em]">ADMINO</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-8">
        <Logo />
        <nav aria-label="Разделы" className="flex flex-wrap items-center gap-6 text-[14px]">
          <a href="#how" className="hover:text-accent">Как это работает</a>
          <a href="#features" className="hover:text-accent">Возможности</a>
          <Link href="/login" className="hover:text-accent">Войти</Link>
          <ButtonLink href="/register" size="sm">Создать салон</ButtonLink>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-6 py-8 text-small text-text-secondary md:px-8">
        <span>© ADMINO, 2026</span>
        <nav aria-label="Документы" className="flex gap-6">
          <Link href="/legal/privacy" className="hover:text-text">Политика конфиденциальности</Link>
          <Link href="/legal/terms" className="hover:text-text">Оферта</Link>
        </nav>
      </div>
    </footer>
  );
}
