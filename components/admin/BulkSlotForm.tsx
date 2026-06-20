"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";

type CourtOption = {
  id: string;
  name: string;
  location_label: string | null;
};

type BulkSlotFormProps = {
  courtOptions: CourtOption[];
  today: string;
  createBulkCourtSlotsAction: (formData: FormData) => void | Promise<void>;
};

function getDateStart(date: string) {
  return new Date(`${date}T00:00:00+08:00`);
}

function getTimeMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getSlotEstimate({
  startDate,
  endDate,
  startTime,
  endTime,
  durationMinutes,
}: {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}) {
  if (!startDate || !endDate || !startTime || !endTime) {
    return {
      dayCount: 0,
      slotsPerDay: 0,
      totalSlots: 0,
      message: "Choose a date range and time range to preview slot generation.",
      warning: "",
    };
  }

  const startDateStart = getDateStart(startDate);
  const endDateStart = getDateStart(endDate);

  if (endDateStart < startDateStart) {
    return {
      dayCount: 0,
      slotsPerDay: 0,
      totalSlots: 0,
      message: "End date must be the same as or after start date.",
      warning: "Please choose a valid date range.",
    };
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const dayCount =
    Math.floor((endDateStart.getTime() - startDateStart.getTime()) / oneDayMs) +
    1;

  const startMinutes = getTimeMinutes(startTime);
  const endMinutes = getTimeMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return {
      dayCount,
      slotsPerDay: 0,
      totalSlots: 0,
      message: "Choose a valid start and end time.",
      warning: "",
    };
  }

  if (endMinutes <= startMinutes) {
    return {
      dayCount,
      slotsPerDay: 0,
      totalSlots: 0,
      message: "End time must be after start time.",
      warning: "Overnight slot generation is not supported yet.",
    };
  }

  const minutesPerDay = endMinutes - startMinutes;
  const slotsPerDay = Math.floor(minutesPerDay / durationMinutes);
  const totalSlots = dayCount * slotsPerDay;

  if (slotsPerDay === 0) {
    return {
      dayCount,
      slotsPerDay,
      totalSlots,
      message: "This time range is too short for the selected duration.",
      warning: "Increase the time range or choose a shorter duration.",
    };
  }

  if (dayCount > 14) {
    return {
      dayCount,
      slotsPerDay,
      totalSlots,
      message: `${dayCount} days × ${slotsPerDay} slot${
        slotsPerDay === 1 ? "" : "s"
      } per day = ${totalSlots} slots.`,
      warning: "Please keep bulk generation to 14 days or fewer.",
    };
  }

  if (totalSlots > 100) {
    return {
      dayCount,
      slotsPerDay,
      totalSlots,
      message: `${dayCount} days × ${slotsPerDay} slot${
        slotsPerDay === 1 ? "" : "s"
      } per day = ${totalSlots} slots.`,
      warning: "Please generate 100 slots or fewer at a time.",
    };
  }

  return {
    dayCount,
    slotsPerDay,
    totalSlots,
    message: `${dayCount} day${dayCount === 1 ? "" : "s"} × ${slotsPerDay} slot${
      slotsPerDay === 1 ? "" : "s"
    } per day = ${totalSlots} total slot${totalSlots === 1 ? "" : "s"}.`,
    warning: "",
  };
}

export function BulkSlotForm({
  courtOptions,
  today,
  createBulkCourtSlotsAction,
}: BulkSlotFormProps) {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [durationMinutes, setDurationMinutes] = useState(60);

  const estimate = useMemo(
    () =>
      getSlotEstimate({
        startDate,
        endDate,
        startTime,
        endTime,
        durationMinutes,
      }),
    [startDate, endDate, startTime, endTime, durationMinutes],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        Bulk create slots
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Generate multiple slots for one court across a date range. Duplicate
        slots are skipped automatically.
      </p>

      <form
        action={createBulkCourtSlotsAction}
        className="mt-6 grid gap-4 md:grid-cols-2"
      >
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
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
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
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
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
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
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
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
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
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes</option>
          </select>
        </div>

        <div
          className={`rounded-xl p-4 text-sm md:col-span-2 ${
            estimate.warning
              ? "bg-yellow-50 text-yellow-800"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <p className="font-medium">Estimated generation</p>
          <p className="mt-1">{estimate.message}</p>

          {estimate.warning ? (
            <p className="mt-2 font-medium">{estimate.warning}</p>
          ) : (
            <p className="mt-2">
              Duplicate slots are skipped automatically. The server still
              validates the 14-day and 100-slot limits before creating slots.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <SubmitButton pendingText="Creating slots..." className="w-full">
            Create slots
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}