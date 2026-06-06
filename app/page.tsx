import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:py-24">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Picko Pickleball
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Book pickleball courts at your fingertips.
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          A beginner-friendly full-stack pickleball court booking app built with Next.js,
          TypeScript, Tailwind CSS, and Supabase. Find your next game today.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Create an account
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Log in
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Project roadmap</h2>

        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li>✅ Project setup</li>
          <li>🚧 Basic layout and navigation</li>
          <li>⬜ Supabase authentication</li>
          <li>⬜ User dashboard</li>
          <li>⬜ Booking system</li>
          <li>⬜ Booking history</li>
          <li>⬜ Deployment to Vercel</li>
        </ul>
      </div>
    </section>
  );
}