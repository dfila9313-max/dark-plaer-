"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell, FormError } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api, ApiError, type User } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      await api<User>("/auth/login", { body: { email: form.get("email"), password: form.get("password") } });
      router.replace("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, "unknown", "Что-то пошло не так"));
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Вход"
      footer={<>Нет аккаунта? <Link href="/register" className="font-medium text-accent">Создать салон</Link></>}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Email" name="email" type="email" autoComplete="email" required error={error?.field("email")} />
        <Field label="Пароль" name="password" type="password" autoComplete="current-password" required />
        <FormError message={error && error.status !== 422 ? error.message : null} />
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Входим…" : "Войти"}</Button>
        <Link href="/forgot-password" className="self-center text-small text-accent">Забыли пароль?</Link>
      </form>
    </AuthShell>
  );
}
