import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCourt } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditCourtPageProps = {
  params: Promise<{
    courtId: string;
  }>;
  searchParams: Promise<{
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
};

export default async function EditCourtPage({
  params,
  searchParams,
}: EditCourtPageProps) {
  await requireAdmin();

  const { courtId } = await params;
  const resolvedSearchParams = await searchParams;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("courts")
    .select(
      "id, name, description, location_label, is_indoor, price_per_hour_cents, is_active",
    )
    .eq("id", courtId)
    .single();

  if (error || !data) {
    notFound();
  }

  const court = data as Court;
  const pricePerHour = court.price_per_hour_cents / 100;

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <Link
          href="/admin/courts"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to courts
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Admin courts
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">Edit court</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Update this court's basic details. Active and inactive status is
          still managed from the main courts page.
        </p>
      </div>

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      <form
        action={updateCourt}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="courtId" value={court.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Court name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={court.name}
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
              defaultValue={court.location_label ?? ""}
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
              defaultValue={pricePerHour}
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
              defaultValue={court.is_indoor ? "true" : "false"}
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
              defaultValue={court.description ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          Current status:{" "}
          <span className="font-semibold text-slate-900">
            {court.is_active ? "Active" : "Inactive"}
          </span>
          <p className="mt-1">
            Use the activate/deactivate button on the courts page to change this
            status.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <SubmitButton pendingText="Saving court...">
            Save changes
          </SubmitButton>

          <Link
            href="/admin/courts"
            className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}