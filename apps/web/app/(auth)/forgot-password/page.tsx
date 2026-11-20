"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell, FormError } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setPending(true);
    setError(null);
    try {
      await api("/auth/password/forgot", { body: { email } });
      setSentTo(email);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, "unknown", "Что-то пошло не так"));
    } finally {
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <AuthShell
        title="Проверьте почту"
        subtitle={<>Если аккаунт с адресом <b className="text-text">{sentTo}</b> существует, мы отправили ссылку для нового пароля. Она действует 1 час.</>}
        footer={<Link href="/login" className="font-medium text-accent">Вернуться ко входу</Link>}
      >
        <Button variant="secondary" onClick={() => setSentTo(null)}>Отправить ещё раз</Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Восстановление доступа"
      subtitle="Пришлём ссылку для нового пароля."
      footer={<Link href="/login" className="font-medium text-accent">Вернуться ко входу</Link>}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Email" name="email" type="email" autoComplete="email" required error={error?.field("email")} />
        <FormError message={error && error.status !== 422 ? error.message : null} />
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Отправляем…" : "Отправить ссылку"}</Button>
      </form>
    </AuthShell>
  );
}
