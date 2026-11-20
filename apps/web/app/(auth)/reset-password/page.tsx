"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { AuthShell, FormError } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api, ApiError } from "@/lib/api";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("password") !== form.get("password2")) {
      setError(new ApiError(0, "mismatch", "Пароли не совпадают"));
      return;
    }
    setPending(true);
    setError(null);
    try {
      await api("/auth/password/reset", { body: { token, password: form.get("password") } });
      router.replace("/login?reset=1");
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, "unknown", "Что-то пошло не так"));
      setPending(false);
    }
  }

  if (!token) {
    return (
      <AuthShell title="Ссылка неполная" subtitle="Откройте ссылку из письма целиком или запросите новую.">
        <Link href="/forgot-password" className="font-medium text-accent">Запросить новую ссылку</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Новый пароль" subtitle="После смены пароля все устройства выйдут из аккаунта.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Новый пароль" name="password" type="password" autoComplete="new-password" required minLength={8} hint="Минимум 8 символов" error={error?.field("password")} />
        <Field label="Повторите пароль" name="password2" type="password" autoComplete="new-password" required />
        <FormError message={error && error.status !== 422 ? error.message : null} />
        {error?.code === "invalid_token" && (
          <Link href="/forgot-password" className="text-small font-medium text-accent">Запросить новую ссылку</Link>
        )}
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Сохраняем…" : "Сохранить пароль"}</Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
