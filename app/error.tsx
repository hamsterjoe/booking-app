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
    <section className="relative flex min-h-screen overflow-hidden bg-black px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
        <div className="absolute right-[-12%] top-20 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-[-16%] left-1/3 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl items-center justify-center">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-400/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-4rem] left-[-3rem] h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-red-200/20 bg-red-400/10 text-3xl">
              !
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-red-200">
              Something went wrong
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Picko hit an unexpected error
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
              Something went wrong while loading this page. You can try again,
              or head back to a safe page.
            </p>

            {error.digest ? (
              <p className="mx-auto mt-5 max-w-xl rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white/45">
                Error reference: {error.digest}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-lime-200"
              >
                Try again
              </button>

              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Go to dashboard
              </Link>

              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}