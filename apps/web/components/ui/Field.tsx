import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputClasses =
  "h-10 w-full rounded-sm border border-border bg-surface px-3 text-[14px] text-text " +
  "placeholder:text-text-secondary focus:border-accent focus:outline-2 focus:outline-accent-soft " +
  "aria-invalid:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

type FieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  hint?: ReactNode;
  error?: string;
};

/** Label + input + hint/error, wired for screen readers. */
export function Field({ label, hint, error, className, ...props }: FieldProps) {
  const id = useId();
  const describedBy = error || hint ? `${id}-desc` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-small font-medium text-text">
        {label}
      </label>
      <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      {(error || hint) && (
        <p id={describedBy} className={cn("text-caption", error ? "text-danger" : "text-text-secondary")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
