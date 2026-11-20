import type { ReactNode } from "react";
import { Logo } from "@/components/marketing/SiteHeader";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <Logo />
      <div className="mt-10 w-full max-w-[400px] rounded-lg border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-h1 font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 text-text-secondary">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-6 text-small text-text-secondary">{footer}</div>}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-sm bg-danger/8 px-3 py-2 text-small text-danger">
      {message}
    </p>
  );
}
