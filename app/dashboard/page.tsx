import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?error=Please log in to access your dashboard");
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Picko dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            You are logged in as{" "}
            <span className="font-medium text-slate-900">{user.email}</span>.
          </p>
        </div>

        <LogoutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Upcoming court bookings
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your upcoming Picko court bookings will appear here once we build the booking
            system.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Court Booking history
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Past court bookings will appear here after we connect the database tables.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Account status
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your account is authenticated through Supabase Auth.
          </p>
        </div>
      </div>
    </section>
  );
}