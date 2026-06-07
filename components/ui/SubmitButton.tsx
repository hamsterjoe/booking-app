"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonVariant = "primary" | "danger" | "secondary";

type SubmitButtonProps = {
  children: ReactNode;
  pendingText: string;
  variant?: SubmitButtonVariant;
  className?: string;
};

const variantClasses: Record<SubmitButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:text-white",
  danger:
    "border border-red-200 text-red-700 hover:bg-red-50 disabled:border-red-100 disabled:bg-red-50 disabled:text-red-300",
  secondary:
    "border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-400",
};

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}