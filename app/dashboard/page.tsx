import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Court = {
  id: string;
  name: string;
  location_label: string | null;
};

type CourtSlot = {
  id: string;
  start_time: string;
  end_time: string;
  courts: Court | null;
};

type Booking = {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_price_cents: number;
  court_slots: CourtSlot | null;
};

function formatBookingDate(dateTime: string) {
  return new Intl.DateTimeFormat("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(dateTime));
}

function formatBookingTime(dateTime: string) {
  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(dateTime));
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(cents / 100);
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?error=Please log in to access your dashboard");
  }

  const nowIso = new Date().toISOString();

  const { data: upcomingBookingsData, error: upcomingBookingsError } =
    await supabase
      .from("bookings")
      .select(
        `
          id,
          status,
          total_price_cents,
          court_slots (
            id,
            start_time,
            end_time,
            courts (
              id,
              name,
              location_label
            )
          )
        `,
      )
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed"])
      .gte("court_slots.start_time", nowIso)
      .order("created_at", { ascending: false });

  const upcomingBookings =
    (upcomingBookingsData ?? []) as unknown as Booking[];

  const sortedUpcomingBookings = upcomingBookings
    .filter((booking) => booking.court_slots?.start_time)
    .sort((a, b) => {
      const aTime = a.court_slots?.start_time ?? "";
      const bTime = b.court_slots?.start_time ?? "";

      return aTime.localeCompare(bTime);
    });

  const nextBooking = sortedUpcomingBookings[0];

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

      {upcomingBookingsError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="font-semibold">Could not load dashboard data</h2>
          <p className="mt-2 text-sm">{upcomingBookingsError.message}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-950">
            Next booking
          </h2>

          {nextBooking?.court_slots?.courts ? (
            <div className="mt-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                {formatBookingDate(nextBooking.court_slots.start_time)}
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-950">
                {nextBooking.court_slots.courts.name}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                {formatBookingTime(nextBooking.court_slots.start_time)} -{" "}
                {formatBookingTime(nextBooking.court_slots.end_time)}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Location:{" "}
                {nextBooking.court_slots.courts.location_label ?? "Picko"}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Price: {formatPrice(nextBooking.total_price_cents)}
              </p>

              <Link
                href="/bookings"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View all bookings
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-slate-600">
                You do not have any upcoming court bookings yet.
              </p>

              <Link
                href="/bookings/new"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Book a court
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Upcoming bookings
          </h2>

          <p className="mt-4 text-4xl font-bold text-slate-950">
            {sortedUpcomingBookings.length}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Confirmed or pending court bookings from now onward.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Quick actions
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/bookings/new"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Book a court
            </Link>

            <Link
              href="/bookings"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              My bookings
            </Link>

            <Link
              href="/courts"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Browse courts
            </Link>

            <Link
              href="/profile"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Profile settings
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-950">
            Account status
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Your account is authenticated through Supabase Auth. Your bookings
            are protected by row-level security so only you can view your own
            booking records.
          </p>
        </div>
      </div>
    </section>
  );
}