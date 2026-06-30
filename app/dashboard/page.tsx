import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Profile = {
  full_name: string | null;
  phone_number: string | null;
};

type Court = {
  id: string;
  name: string;
};

type CourtSlot = {
  id: string;
  start_time: string;
  end_time: string;
  courts: Court | null;
};

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type Booking = {
  id: string;
  status: BookingStatus;
  total_price_cents: number;
  court_slots: CourtSlot | null;
};

function formatBookingDate(dateTime: string) {
  return new Intl.DateTimeFormat("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
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
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getStatusLabel(status: BookingStatus) {
  if (status === "confirmed") {
    return "Upcoming";
  }

  if (status === "pending") {
    return "Pending";
  }

  if (status === "completed") {
    return "Completed";
  }

  return "Cancelled";
}

function getInitials(name: string | null | undefined, email: string | undefined) {
  const source = name?.trim() || email || "Picko";

  const words = source
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "P";
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

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, phone_number")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  const { data: upcomingBookingsData, error: upcomingBookingsError } =
    await supabase
      .from("bookings")
      .select(
        `
          id,
          status,
          total_price_cents,
          court_slots!inner (
            id,
            start_time,
            end_time,
            courts (
              id,
              name
            )
          )
        `,
      )
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed"])
      .gte("court_slots.start_time", nowIso);

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

  const nextSevenDaysEnd = new Date();
  nextSevenDaysEnd.setDate(nextSevenDaysEnd.getDate() + 7);

  const nextSevenDaysBookings = sortedUpcomingBookings.filter((booking) => {
    const startTime = booking.court_slots?.start_time;

    if (!startTime) {
      return false;
    }

    return new Date(startTime).getTime() <= nextSevenDaysEnd.getTime();
  });

  const weeklyMeterValue = Math.min(nextSevenDaysBookings.length, 5);

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "there";

  const profileIsComplete = Boolean(
    profile?.full_name?.trim() && profile?.phone_number?.trim(),
  );

  const initials = getInitials(profile?.full_name, user.email);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black px-6 pb-10 pt-24 text-white sm:pt-28">      <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />
      <div className="absolute right-[-8%] top-28 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-[-12%] left-1/3 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
    </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-lime-300/80">
              Picko dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Welcome back, {displayName}
            </h1>
          </div>

          <LogoutButton />
        </div>

        {upcomingBookingsError ? (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-red-100 shadow-2xl shadow-red-950/20 backdrop-blur-xl">
            <h2 className="font-semibold">Could not load dashboard data</h2>
            <p className="mt-2 text-sm text-red-100/80">
              {upcomingBookingsError.message}
            </p>
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:col-span-4">
            <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-lime-300/20 blur-2xl" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-black text-lime-200 shadow-inner">
                    {initials}
                  </div>

                  <div>
                    <p className="text-sm text-white/50">Signed in as</p>
                    <p className="font-semibold text-white">{user.email}</p>
                  </div>
                </div>

                <h2 className="mt-8 max-w-xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Ready for your next Picko session?
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                  Book faster, track your upcoming games, and keep your playing
                  profile ready for future match preferences.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                    Next 7 days
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {nextSevenDaysBookings.length}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    Upcoming sessions
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                    Next court
                  </p>
                  <p className="mt-2 truncate text-lg font-bold text-white">
                    {nextBooking?.court_slots?.courts?.name ?? "Not booked"}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {nextBooking?.court_slots?.start_time
                      ? formatBookingDate(nextBooking.court_slots.start_time)
                      : "Book when ready"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                    Weekly game meter
                  </p>

                  <div className="mt-3 flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-8 flex-1 rounded-full ${index < weeklyMeterValue
                          ? "bg-lime-300"
                          : "bg-white/15"
                          }`}
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-white/45">
                    Based on upcoming bookings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/bookings/new"
            className="group relative overflow-hidden rounded-[2rem] border border-blue-300/20 bg-slate-950 p-6 text-white shadow-2xl shadow-blue-950/40 transition duration-300 hover:-translate-y-1 hover:border-blue-300/35 hover:shadow-blue-500/25 lg:col-span-2"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.45),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.35),transparent_30%),radial-gradient(circle_at_70%_85%,rgba(37,99,235,0.5),transparent_34%),linear-gradient(135deg,rgba(2,6,23,1),rgba(15,23,42,0.96))]" />
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-300/25 blur-2xl transition duration-300 group-hover:scale-125" />
            <div className="absolute bottom-[-3rem] left-[-3rem] h-44 w-44 rounded-full bg-blue-600/30 blur-2xl" />
            <div className="absolute right-8 top-24 h-20 w-20 rounded-full bg-cyan-200/15 blur-xl" />
            <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-sky-200/60 to-transparent" />

            <div className="relative flex min-h-64 flex-col justify-between gap-8">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200/25 bg-white/10 text-xl font-black text-sky-100 shadow-inner backdrop-blur">
                    +
                  </div>

                  <div className="rounded-full border border-sky-200/25 bg-white/10 px-3 py-1 text-xs font-bold text-sky-100 shadow-inner backdrop-blur">
                    Fast booking
                  </div>
                </div>

                <h2 className="mt-7 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                  Book a Court Today
                </h2>

                <p className="mt-4 text-sm font-medium leading-6 text-sky-50/80">
                  Choose your date, pick a slot, and confirm your next game in a
                  few taps.
                </p>
              </div>

              <div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-sky-200/20 bg-white/10 p-3 text-center shadow-inner backdrop-blur">
                    <p className="text-lg font-black text-white">1</p>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-sky-100/70">
                      Date
                    </p>
                  </div>

                  <div className="rounded-2xl border border-sky-200/20 bg-white/10 p-3 text-center shadow-inner backdrop-blur">
                    <p className="text-lg font-black text-white">2</p>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-sky-100/70">
                      Slot
                    </p>
                  </div>

                  <div className="rounded-2xl border border-sky-200/20 bg-white/10 p-3 text-center shadow-inner backdrop-blur">
                    <p className="text-lg font-black text-white">3</p>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-sky-100/70">
                      Play
                    </p>
                  </div>
                </div>

                <span className="mt-5 inline-flex w-full justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-gray-700 shadow-lg shadow-blue-950/20 transition group-hover:bg-sky-200 group-hover:text-slate-950">
                  Start booking →
                </span>
              </div>
            </div>
          </Link>

          <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-950 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
                  Next booking
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Your next session
                </h2>
              </div>

              {nextBooking ? (
                <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-700">
                  {getStatusLabel(nextBooking.status)}
                </span>
              ) : null}
            </div>

            {nextBooking?.court_slots?.courts ? (
              <div className="mt-6">
                <h3 className="text-3xl font-black tracking-tight">
                  {nextBooking.court_slots.courts.name}
                </h3>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </p>
                    <p className="mt-2 font-bold text-slate-950">
                      {formatBookingDate(nextBooking.court_slots.start_time)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Time
                    </p>
                    <p className="mt-2 font-bold text-slate-950">
                      {formatBookingTime(nextBooking.court_slots.start_time)} -{" "}
                      {formatBookingTime(nextBooking.court_slots.end_time)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">
                    {formatPrice(nextBooking.total_price_cents)}
                  </p>

                  <Link
                    href={`/bookings/${nextBooking.id}?returnTo=${encodeURIComponent(
                      "/dashboard",
                    )}`}
                    className="inline-flex justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <h3 className="text-xl font-black text-slate-950">
                  No upcoming booking yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your next booking will appear here once you reserve a court.
                </p>

                <Link
                  href="/bookings/new"
                  className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Book your first slot
                </Link>
              </div>
            )}
          </div>

          <div
            className={`rounded-[2rem] border p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3 ${profileIsComplete
              ? "border-white/10 bg-white/[0.08] text-white"
              : "border-amber-300/30 bg-amber-300/15 text-amber-50"
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={`text-sm font-bold uppercase tracking-[0.2em] ${profileIsComplete ? "text-lime-300" : "text-amber-200"
                    }`}
                >
                  Profile
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  {profileIsComplete
                    ? "Your player profile"
                    : "Complete your profile"}
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${profileIsComplete
                  ? "bg-lime-300/15 text-lime-200"
                  : "bg-amber-200 text-amber-950"
                  }`}
              >
                {profileIsComplete ? "Ready" : "Action needed"}
              </span>
            </div>

            {profileIsComplete ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                    Name
                  </p>
                  <p className="mt-2 font-bold text-white">
                    {profile?.full_name}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                    Phone
                  </p>
                  <p className="mt-2 font-bold text-white">
                    {profile?.phone_number}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                    Skill score
                  </p>
                  <p className="mt-2 font-bold text-white">Not set yet</p>
                  <p className="mt-1 text-sm text-white/50">
                    You can self-input this later in profile preferences.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm leading-6 text-amber-50/80">
                  Add your name and phone number so your booking details are
                  ready before checkout.
                </p>

                <Link
                  href="/profile"
                  className="mt-5 inline-flex rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-amber-950 transition hover:bg-white"
                >
                  Complete profile
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/bookings"
            className="group rounded-[2rem] border border-lime-300/20 bg-white/[0.08] p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-lime-300/35 hover:bg-lime-300/10 lg:col-span-2"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-200">
              My bookings
            </p>

            <h2 className="mt-4 text-2xl font-black tracking-tight">
              View your sessions
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Check upcoming, completed, cancelled, and all booking records.
            </p>

            <span className="mt-6 inline-flex text-sm font-bold text-lime-200 transition group-hover:translate-x-1">
              Open bookings →
            </span>
          </Link>

          <div className="rounded-[2rem] border border-white/70 bg-white/95 p-6 text-slate-950 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              Booking policy
            </p>

            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Plan with confidence
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Cancellations are allowed up to 6 hours before your court time.
            </p>
          </div>

          <Link
            href="/profile"
            className="group rounded-[2rem] border border-blue-200/20 bg-blue-200/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-blue-200/35 hover:bg-blue-200/15 lg:col-span-2"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Preferences
            </p>

            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Profile settings
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Keep your contact details ready. Skill preferences can be added in
              a future profile update.
            </p>

            <span className="mt-6 inline-flex text-sm font-bold text-blue-100 transition group-hover:translate-x-1">
              Manage profile →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}