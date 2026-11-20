"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell, FormError } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api, ApiError, type User } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      await api<User>("/auth/register", {
        body: { full_name: form.get("full_name"), email: form.get("email"), password: form.get("password") },
      });
      router.replace("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, "unknown", "Что-то пошло не так"));
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Создать салон"
      subtitle="Сначала аккаунт владельца, затем данные салона."
      footer={<>Уже есть аккаунт? <Link href="/login" className="font-medium text-accent">Войти</Link></>}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Ваше имя" name="full_name" autoComplete="name" required error={error?.field("full_name")} />
        <Field label="Email" name="email" type="email" autoComplete="email" required error={error?.field("email")} />
        <Field
          label="Пароль"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="Минимум 8 символов"
          error={error?.field("password")}
        />
        <FormError message={error && error.status !== 422 ? error.message : null} />
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Создаём…" : "Создать аккаунт"}</Button>
        <p className="text-caption text-text-secondary">
          Нажимая кнопку, вы принимаете <Link href="/legal/terms" className="underline">оферту</Link> и{" "}
          <Link href="/legal/privacy" className="underline">политику обработки персональных данных</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
