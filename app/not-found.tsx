import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        404
      </p>

      <h1 className="mt-3 text-4xl font-bold text-slate-950">
        Page not found
      </h1>

      <p className="mt-4 max-w-xl text-slate-600">
        The page you are looking for does not exist, may have been moved, or may
        no longer be available.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go home
        </Link>

        <Link
          href="/bookings/new"
          className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Book a court
        </Link>

        <Link
          href="/courts"
          className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Browse courts
        </Link>
      </div>
    </section>
  );
}