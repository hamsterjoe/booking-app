import Link from "next/link";
import { login } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <section className="mx-auto flex max-w-md flex-col px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Log in</h1>

        <p className="mt-2 text-sm text-slate-600">
          Log in to access your dashboard and manage your bookings.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}

        {params.message ? (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {params.message}
          </p>
        ) : null}

        <form action={login} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Do not have an account?{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}