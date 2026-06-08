import Link from "next/link";
import { createCourt, toggleCourtActive } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminCourtsPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

type Court = {
  id: string;
  name: string;
  description: string | null;
  location_label: string | null;
  is_indoor: boolean;
  price_per_hour_cents: number;
  is_active: boolean;
  created_at: string;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(cents / 100);
}

function formatDate(dateTime: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(dateTime));
}

export default async function AdminCourtsPage({
  searchParams,
}: AdminCourtsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("courts")
    .select(
      "id, name, description, location_label, is_indoor, price_per_hour_cents, is_active, created_at",
    )
    .order("name", { ascending: true });

  const courts = (data ?? []) as Court[];

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
          Admin courts
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Manage courts
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Create and manage Picko pickleball courts. Inactive courts are hidden
          from users and cannot be booked.
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
          Create court
        </h2>

        <form action={createCourt} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Court name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Court A"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="locationLabel"
              className="text-sm font-medium text-slate-700"
            >
              Location label
            </label>

            <input
              id="locationLabel"
              name="locationLabel"
              type="text"
              placeholder="Picko Main Hall"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="pricePerHour"
              className="text-sm font-medium text-slate-700"
            >
              Price per hour, RM
            </label>

            <input
              id="pricePerHour"
              name="pricePerHour"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue="60"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="isIndoor"
              className="text-sm font-medium text-slate-700"
            >
              Court type
            </label>

            <select
              id="isIndoor"
              name="isIndoor"
              defaultValue="true"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="true">Indoor</option>
              <option value="false">Outdoor</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Short court description"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <SubmitButton pendingText="Creating court..." className="w-full">
              Create court
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Existing courts
        </h2>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error.message}
          </p>
        ) : courts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No courts have been created yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-4">
            {courts.map((court) => (
              <article
                key={court.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-950">
                        {court.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${court.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-200 text-slate-600"
                          }`}
                      >
                        {court.is_active ? "Active" : "Inactive"}
                      </span>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {court.is_indoor ? "Indoor" : "Outdoor"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {court.description ?? "No description provided."}
                    </p>

                    <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                      <div>
                        <p className="font-medium text-slate-900">Location</p>
                        <p>{court.location_label ?? "Picko"}</p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">Price</p>
                        <p>{formatPrice(court.price_per_hour_cents)} / hour</p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">Created</p>
                        <p>{formatDate(court.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <Link
                      href={`/admin/courts/${court.id}/edit`}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </Link>

                    <form action={toggleCourtActive}>
                      <input type="hidden" name="courtId" value={court.id} />
                      <input
                        type="hidden"
                        name="nextIsActive"
                        value={court.is_active ? "false" : "true"}
                      />
                      <SubmitButton
                        pendingText={court.is_active ? "Deactivating..." : "Activating..."}
                        variant={court.is_active ? "danger" : "secondary"}
                      >
                        {court.is_active ? "Deactivate" : "Activate"}
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}