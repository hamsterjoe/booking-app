import Link from "next/link";
import { register } from "@/app/auth/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

type RegisterCardProps = {
  error?: string;
  message?: string;
  errorRedirectTo?: string;
};

export function RegisterCard({
  error,
  message,
  errorRedirectTo = "/register",
}: RegisterCardProps) {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/50 backdrop-blur-2xl">
      <div className="px-7 py-10 sm:px-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-300 shadow-[0_0_45px_rgba(250,204,21,0.45)]">
          <div className="h-12 w-12 rounded-full border-[6px] border-yellow-500 bg-yellow-200 shadow-inner" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-100">
            Join us today
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Create your Picko account
          </h1>

          <p className="mt-4 text-base leading-7 text-zinc-400">
            Book courts faster, manage your games, and keep every reservation in
            one clean dashboard.
          </p>
        </div>

        {error ? (
          <p className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </p>
        ) : null}

        <form action={register} className="mt-8 space-y-6">
          <input type="hidden" name="errorRedirectTo" value={errorRedirectTo} />

          <div>
            <label htmlFor="email" className="text-base font-semibold text-white">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-3 w-full rounded-xl border border-white/15 bg-black/60 px-5 py-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-base font-semibold text-white"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Create a password"
              className="mt-3 w-full rounded-xl border border-white/15 bg-black/60 px-5 py-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
            />
          </div>

          <SubmitButton
            pendingText="Creating account..."
            className="w-full rounded-xl bg-white px-5 py-4 text-base font-bold text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            Sign up
          </SubmitButton>
        </form>
      </div>

      <div className="border-t border-white/10 bg-white/[0.03] px-7 py-6 text-center text-base text-zinc-400 sm:px-10">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-white hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}