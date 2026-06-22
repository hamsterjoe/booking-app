"use client";

import { useState } from "react";
import { register } from "@/app/auth/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

type RegisterFormProps = {
  errorRedirectTo?: string;
};

type FormErrors = {
  email?: string;
  password?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RegisterForm({
  errorRedirectTo = "/register",
}: RegisterFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const nextErrors: FormErrors = {};

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
    }
  }

  const emailHasError = Boolean(errors.email);
  const passwordHasError = Boolean(errors.password);

  return (
    <form
      action={register}
      noValidate
      onSubmit={handleSubmit}
      className="mt-6 space-y-4"
    >
      <input type="hidden" name="errorRedirectTo" value={errorRedirectTo} />

      <div>
        <label htmlFor="email" className="text-sm font-semibold text-white">
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          aria-invalid={emailHasError}
          aria-describedby={emailHasError ? "email-error" : undefined}
          placeholder="you@example.com"
          className={`mt-2 w-full rounded-xl border bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:ring-4 ${
            emailHasError
              ? "border-red-400/70 focus:border-red-300 focus:ring-red-400/10"
              : "border-white/15 focus:border-sky-300 focus:ring-sky-300/10"
          }`}
        />

        {errors.email ? (
          <p id="email-error" className="mt-2 text-xs font-medium text-red-300">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-white">
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          aria-invalid={passwordHasError}
          aria-describedby={
            passwordHasError ? "password-error" : "password-help"
          }
          placeholder="Create a password"
          className={`mt-2 w-full rounded-xl border bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:ring-4 ${
            passwordHasError
              ? "border-red-400/70 focus:border-red-300 focus:ring-red-400/10"
              : "border-white/15 focus:border-sky-300 focus:ring-sky-300/10"
          }`}
        />

        {errors.password ? (
          <p
            id="password-error"
            className="mt-2 text-xs font-medium text-red-300"
          >
            {errors.password}
          </p>
        ) : (
          <p id="password-help" className="mt-2 text-xs text-zinc-500">
            Use at least 6 characters.
          </p>
        )}
      </div>

      <SubmitButton
        pendingText="Creating account..."
        className="w-full rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        Sign up
      </SubmitButton>
    </form>
  );
}