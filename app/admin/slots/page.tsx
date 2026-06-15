import Link from "next/link";
import { createCourtSlot, createBulkCourtSlots, toggleCourtSlotAvailability } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SlotFiltersForm } from "@/components/admin/SlotFiltersForm";
import { SubmitButton } from "@/components/ui/SubmitButton";

type AdminSlotsPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
    date?: string;
    courtId?: string;
    status?: string;
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
  bookings: Array<{
    id: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
  }> | null;
};

type SlotStatusFilter = "all" | "available" | "booked" | "blocked";

const slotStatusFilters: SlotStatusFilter[] = [
  "all",
  "available",
  "booked",
  "blocked",
];

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

function isValidDateInput(value: string | undefined) {
  if (!value) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getMalaysiaDateRange(date: string) {
  const start = new Date(`${date}T00:00:00+08:00`);
  const end = new Date(start);

  end.setUTCDate(end.getUTCDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function isValidSlotStatusFilter(
  status: string | undefined,
): status is SlotStatusFilter {
  return slotStatusFilters.includes((status ?? "all") as SlotStatusFilter);
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

function hasActiveBooking(slot: CourtSlot) {
  return (
    slot.bookings?.some(
      (booking) =>
        booking.status === "pending" || booking.status === "confirmed",
    ) ?? false
  );
}

function getSlotStatus(slot: CourtSlot) {
  if (hasActiveBooking(slot)) {
    return {
      label: "Booked",
      className: "bg-yellow-50 text-yellow-700",
    };
  }

  if (slot.is_available) {
    return {
      label: "Available",
      className: "bg-green-50 text-green-700",
    };
  }

  return {
    label: "Blocked",
    className: "bg-slate-200 text-slate-600",
  };
}

function getSlotFilterStatus(slot: CourtSlot): Exclude<SlotStatusFilter, "all"> {
  if (hasActiveBooking(slot)) {
    return "booked";
  }

  if (slot.is_available) {
    return "available";
  }

  return "blocked";
}

export default async function AdminSlotsPage({
  searchParams,
}: AdminSlotsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const selectedDate = isValidDateInput(params.date)
    ? params.date!
    : getTodayInMalaysia();
  const selectedCourtId = params.courtId ?? "all";
  const selectedStatus = isValidSlotStatusFilter(params.status)
    ? params.status ?? "all"
    : "all";
  const { startIso, endIso } = getMalaysiaDateRange(selectedDate);

  const supabase = await createSupabaseServerClient();

  const { data: courts, error: courtsError } = await supabase
    .from("courts")
    .select("id, name, location_label")
    .order("name", { ascending: true });

  let slotsQuery = supabase
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
          ),
          bookings (
            id,
            status
          )
        `,
    )
    .gte("start_time", startIso)
    .lt("start_time", endIso)
    .order("start_time", { ascending: true });

  if (selectedCourtId !== "all") {
    slotsQuery = slotsQuery.eq("court_id", selectedCourtId);
  }

  const { data: slots, error: slotsError } = await slotsQuery;

  const courtOptions = (courts ?? []) as Court[];
  const slotsForSelectedDate = (slots ?? []) as unknown as CourtSlot[];

  const filteredSlots =
    selectedStatus === "all"
      ? slotsForSelectedDate
      : slotsForSelectedDate.filter(
        (slot) => getSlotFilterStatus(slot) === selectedStatus,
      );

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
          Bulk create slots
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Generate multiple slots for one court on one date.
        </p>

        <form action={createBulkCourtSlots} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="bulkCourtId"
              className="text-sm font-medium text-slate-700"
            >
              Court
            </label>
            <select
              id="bulkCourtId"
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
            <label
              htmlFor="bulkStartDate"
              className="text-sm font-medium text-slate-700"
            >
              Start date
            </label>
            <input
              id="bulkStartDate"
              name="startDate"
              type="date"
              required
              defaultValue={getTodayInMalaysia()}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bulkEndDate"
              className="text-sm font-medium text-slate-700"
            >
              End date
            </label>
            <input
              id="bulkEndDate"
              name="endDate"
              type="date"
              required
              defaultValue={getTodayInMalaysia()}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bulkStartTime"
              className="text-sm font-medium text-slate-700"
            >
              Start time
            </label>
            <input
              id="bulkStartTime"
              name="startTime"
              type="time"
              required
              defaultValue="08:00"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bulkEndTime"
              className="text-sm font-medium text-slate-700"
            >
              End time
            </label>
            <input
              id="bulkEndTime"
              name="endTime"
              type="time"
              required
              defaultValue="12:00"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bulkDurationMinutes"
              className="text-sm font-medium text-slate-700"
            >
              Slot duration
            </label>
            <select
              id="bulkDurationMinutes"
              name="durationMinutes"
              defaultValue="60"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700 md:col-span-2">
            Example: 10 Jun to 14 Jun, 8:00 AM to 12:00 PM, with 60-minute duration creates 4 slots per day. Duplicate slots are skipped automatically.
          </div>

          <div className="md:col-span-2">
            <SubmitButton pendingText="Creating slots..." className="w-full">
              Create slots
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Filter slots</h2>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Filter slots</h2>

          <SlotFiltersForm
            courtOptions={courtOptions}
            selectedDate={selectedDate}
            selectedCourtId={selectedCourtId}
            selectedStatus={selectedStatus}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Slots for selected date
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Showing {filteredSlots.length} slot{filteredSlots.length === 1 ? "" : "s"} for{" "}
          <span className="font-medium text-slate-900">
            {formatSlotDate(`${selectedDate}T00:00:00+08:00`)}
          </span>
          .
        </p>

        {slotsError ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {slotsError.message}
          </p>
        ) : filteredSlots.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No slots match these filters.
          </p>
        ) : (
          <div className="mt-6 grid gap-3">
            {filteredSlots.map((slot) => {
              const slotStatus = getSlotStatus(slot);
              const activeBooking = hasActiveBooking(slot);

              return (
                <article
                  key={slot.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${slotStatus.className}`}
                      >
                        {slotStatus.label}
                      </span>

                      {activeBooking ? (
                        <p className="max-w-xs text-left text-xs text-slate-500 sm:text-right">
                          This slot has an active booking and cannot be changed here.
                        </p>
                      ) : (
                        <form action={toggleCourtSlotAvailability}>
                          <input type="hidden" name="slotId" value={slot.id} />
                          <input
                            type="hidden"
                            name="nextIsAvailable"
                            value={slot.is_available ? "false" : "true"}
                          />

                          <SubmitButton
                            pendingText={slot.is_available ? "Deactivating..." : "Reactivating..."}
                            variant={slot.is_available ? "danger" : "secondary"}
                          >
                            {slot.is_available ? "Deactivate" : "Reactivate"}
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}