import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Court = {
  id: string;
  name: string;
  description: string | null;
  location_label: string | null;
  is_indoor: boolean;
  price_per_hour_cents: number;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(cents / 100);
}

export default async function CourtsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: courts, error } = await supabase
    .from("courts")
    .select(
      "id, name, description, location_label, is_indoor, price_per_hour_cents",
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-semibold">Could not load courts</h1>
          <p className="mt-2 text-sm">{error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Picko courts
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Choose a pickleball court
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Browse available courts at Picko. In the next milestone, we will show
          available time slots for each court.
        </p>
      </div>

      {courts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          No courts are available right now.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courts.map((court: Court) => (
            <article
              key={court.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {court.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    {court.description ?? "No description available."}
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {court.is_indoor ? "Indoor" : "Outdoor"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-slate-900">Location</p>
                  <p>{court.location_label ?? "Picko"}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-900">Price</p>
                  <p>{formatPrice(court.price_per_hour_cents)} / hour</p>
                </div>

                  <Link
                href={`/courts/${court.id}`}
                className="mt-6 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                  >
                View available slots
              </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}