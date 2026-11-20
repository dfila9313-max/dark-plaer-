"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/marketing/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api, ApiError, type User } from "@/lib/api";

// Signed-in landing. Company creation and the full cabinet arrive in stage 3.
export default function AppHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api<User>("/me")
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.replace("/login");
      });
  }, [router]);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
  }

  if (!user) return <p className="p-8 text-text-secondary">Загрузка…</p>;

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <Logo />
        <Button variant="ghost" size="sm" onClick={logout}>Выйти</Button>
      </div>
      <Card className="p-6">
        <h1 className="text-h1 font-semibold">Здравствуйте, {user.full_name}</h1>
        <p className="mt-2 text-text-secondary">Вы вошли как {user.email}.</p>
      </Card>
    </div>
  );
}
