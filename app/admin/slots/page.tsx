import Link from "next/link";
import { createCourtSlot } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/SubmitButton";

type AdminSlotsPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

type Court = {
  id: string;
  name: string;
  location_label: string | null;
};

type CourtSlot = {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  courts: Court | null;
};

function getTodayInMalaysia() {
  const parts = new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function formatSlotDate(dateTime: string) {
  return new Intl.DateTimeFormat("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(dateTime));
}

function formatSlotTime(dateTime: string) {
  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(dateTime));
}

export default async function AdminSlotsPage({
  searchParams,
}: AdminSlotsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: courts, error: courtsError } = await supabase
    .from("courts")
    .select("id, name, location_label")
    .order("name", { ascending: true });

  const { data: slots, error: slotsError } = await supabase
    .from("court_slots")
    .select(
      `
        id,
        start_time,
        end_time,
        is_available,
        courts (
          id,
          name,
          location_label
        )
      `,
    )
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(20);

  const courtOptions = (courts ?? []) as Court[];
  const upcomingSlots = (slots ?? []) as unknown as CourtSlot[];

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <div>
        <Link
          href="/admin"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to admin
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Admin slots
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Manage court slots
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Create new Picko court availability slots and review upcoming slots.
        </p>
      </div>

      {params.message ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {params.message}
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {params.error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Create court slot
        </h2>

        {courtsError ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {courtsError.message}
          </p>
        ) : null}

        <form action={createCourtSlot} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="courtId"
              className="text-sm font-medium text-slate-700"
            >
              Court
            </label>

            <select
              id="courtId"
              name="courtId"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select a court</option>

              {courtOptions.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                  {court.location_label ? ` — ${court.location_label}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="text-sm font-medium text-slate-700">
              Date
            </label>

            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={getTodayInMalaysia()}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="startTime"
              className="text-sm font-medium text-slate-700"
            >
              Start time
            </label>

            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue="10:00"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="durationMinutes"
              className="text-sm font-medium text-slate-700"
            >
              Duration
            </label>

            <select
              id="durationMinutes"
              name="durationMinutes"
              defaultValue="60"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <SubmitButton pendingText="Creating slot..." className="w-full">
              Create slot
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Upcoming slots
        </h2>

        {slotsError ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {slotsError.message}
          </p>
        ) : upcomingSlots.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No upcoming slots have been created yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-3">
            {upcomingSlots.map((slot) => (
              <article
                key={slot.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {slot.courts?.name ?? "Unknown court"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {formatSlotDate(slot.start_time)} ·{" "}
                      {formatSlotTime(slot.start_time)} -{" "}
                      {formatSlotTime(slot.end_time)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {slot.courts?.location_label ?? "Picko"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      slot.is_available
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {slot.is_available ? "Available" : "Unavailable / booked"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}