"use client";

import Link from "next/link";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
        Something went wrong
      </p>

      <h1 className="mt-3 text-4xl font-bold text-slate-950">
        Picko hit an unexpected error
      </h1>

      <p className="mt-4 max-w-xl text-slate-600">
        Something went wrong while loading this page. You can try again, or go
        back to a safe page.
      </p>

      {error.digest ? (
        <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
          Error reference: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try again
        </button>

        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Go to dashboard
        </Link>

        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}