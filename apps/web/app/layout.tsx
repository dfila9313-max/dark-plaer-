import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ADMINO — онлайн-запись и управление салоном",
    template: "%s · ADMINO",
  },
  description:
    "Платформа для барбершопов и салонов красоты: онлайн-запись, расписание мастеров, клиенты и команда в одном месте.",
};

export const viewport: Viewport = {
  themeColor: "#f7f7f5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full bg-bg text-text text-body">{children}</body>
    </html>
  );
}
