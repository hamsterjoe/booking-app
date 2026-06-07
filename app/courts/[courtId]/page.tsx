import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Court = {
  id: string;
  name: string;
  description: string | null;
  location_label: string | null;
  is_indoor: boolean;
  price_per_hour_cents: number;
};

type CourtSlot = {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

type CourtDetailsPageProps = {
  params: Promise<{
    courtId: string;
  }>;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(cents / 100);
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

function getDurationInMinutes(startTime: string, endTime: string) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  return Math.round((end - start) / 1000 / 60);
}

export default async function CourtDetailsPage({
  params,
}: CourtDetailsPageProps) {
  const { courtId } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: court, error: courtError } = await supabase
    .from("courts")
    .select(
      "id, name, description, location_label, is_indoor, price_per_hour_cents",
    )
    .eq("id", courtId)
    .eq("is_active", true)
    .single();

  if (courtError || !court) {
    notFound();
  }

  const { data: slots, error: slotsError } = await supabase
    .from("court_slots")
    .select("id, start_time, end_time, is_available")
    .eq("court_id", court.id)
    .eq("is_available", true)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  const availableSlots = (slots ?? []) as CourtSlot[];

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <div>
        <Link
          href="/courts"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to courts
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Picko court
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                {(court as Court).name}
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                {(court as Court).description ?? "No description available."}
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {(court as Court).is_indoor ? "Indoor" : "Outdoor"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <p className="font-medium text-slate-900">Location</p>
              <p>{(court as Court).location_label ?? "Picko"}</p>
            </div>

            <div>
              <p className="font-medium text-slate-900">Price</p>
              <p>{formatPrice((court as Court).price_per_hour_cents)} / hour</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Available time slots
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Choose a time slot for this court. In the next milestone, we will make
          these slots bookable.
        </p>

        {slotsError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h3 className="font-semibold">Could not load slots</h3>
            <p className="mt-2 text-sm">{slotsError.message}</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            No available slots for this court right now.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {availableSlots.map((slot) => {
              const durationMinutes = getDurationInMinutes(
                slot.start_time,
                slot.end_time,
              );

              return (
                <article
                  key={slot.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    {formatSlotDate(slot.start_time)}
                  </p>

                  <h3 className="mt-2 text-xl font-semibold text-slate-950">
                    {formatSlotTime(slot.start_time)} -{" "}
                    {formatSlotTime(slot.end_time)}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Duration: {durationMinutes} minutes
                  </p>

                  <button
                    type="button"
                    disabled
                    className="mt-5 w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                  >
                    Booking coming next
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}