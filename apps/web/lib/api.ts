/** Thin client for the ADMINO API. Errors arrive in one shape: {error: {code, message, fields?}}. */

export type FieldError = { loc: (string | number)[]; msg: string; type: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: FieldError[] = [],
  ) {
    super(message);
  }

  /** Message for one form field, from a 422 response. */
  field(name: string): string | undefined {
    const f = this.fields.find((e) => e.loc.at(-1) === name);
    if (!f) return undefined;
    if (name === "password" && f.type === "string_too_short") return "Минимум 8 символов";
    if (name === "email") return "Проверьте адрес почты";
    return "Проверьте значение";
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: init.body === undefined ? undefined : { "content-type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(0, "network", "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const err = data?.error;
    throw new ApiError(
      response.status,
      err?.code ?? "unknown",
      response.status === 422 ? "Проверьте поля формы" : (err?.message ?? "Что-то пошло не так. Попробуйте ещё раз."),
      err?.fields ?? [],
    );
  }
  return data as T;
}

export type User = { id: string; email: string; full_name: string; is_platform_admin: boolean };
