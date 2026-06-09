"use client";

import { useRouter } from "next/navigation";

type CourtOption = {
  id: string;
  name: string;
  location_label: string | null;
};

type SlotFiltersFormProps = {
  courtOptions: CourtOption[];
  selectedDate: string;
  selectedCourtId: string;
  selectedStatus: string;
};

export function SlotFiltersForm({
  courtOptions,
  selectedDate,
  selectedCourtId,
  selectedStatus,
}: SlotFiltersFormProps) {
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const date = String(formData.get("date") ?? "");
    const courtId = String(formData.get("courtId") ?? "all");
    const status = String(formData.get("status") ?? "all");

    const params = new URLSearchParams();

    if (date) {
      params.set("date", date);
    }

    if (courtId !== "all") {
      params.set("courtId", courtId);
    }

    if (status !== "all") {
      params.set("status", status);
    }

    const queryString = params.toString();
    const url = queryString ? `/admin/slots?${queryString}` : "/admin/slots";

    router.push(url, { scroll: false });
  }

  function handleReset() {
    router.push("/admin/slots", { scroll: false });
  }

  return (
    <form action={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-3">
      <div>
        <label
          htmlFor="filterDate"
          className="text-sm font-medium text-slate-700"
        >
          Date
        </label>
        <input
          id="filterDate"
          name="date"
          type="date"
          required
          defaultValue={selectedDate}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="filterCourtId"
          className="text-sm font-medium text-slate-700"
        >
          Court
        </label>
        <select
          id="filterCourtId"
          name="courtId"
          defaultValue={selectedCourtId}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All courts</option>
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
          htmlFor="filterStatus"
          className="text-sm font-medium text-slate-700"
        >
          Status
        </label>
        <select
          id="filterStatus"
          name="status"
          defaultValue={selectedStatus}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 md:col-span-3 sm:flex-row">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Apply filters
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 px-5 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Reset filters
        </button>
      </div>
    </form>
  );
}