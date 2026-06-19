import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Court = {
    id: string;
    name: string;
    location_label: string | null;
    is_indoor: boolean;
    price_per_hour_cents: number;
};

type CourtSlot = {
    id: string;
    start_time: string;
    end_time: string;
    courts: Court | null;
};

type BookingPageProps = {
    searchParams: Promise<{
        date?: string;
        message?: string;
        error?: string;
    }>;
};

type GroupedSlot = {
    start_time: string;
    end_time: string;
    slots: CourtSlot[];
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

function formatPrice(cents: number) {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
    }).format(cents / 100);
}

function formatSlotDate(dateTime: string) {
    return new Intl.DateTimeFormat("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "long",
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

function groupSlotsByTime(slots: CourtSlot[]) {
    return slots.reduce<Record<string, GroupedSlot>>((groups, slot) => {
        const key = `${slot.start_time}-${slot.end_time}`;

        if (!groups[key]) {
            groups[key] = {
                start_time: slot.start_time,
                end_time: slot.end_time,
                slots: [],
            };
        }

        groups[key].slots.push(slot);

        return groups;
    }, {});
}

export default async function NewBookingPage({
    searchParams,
}: BookingPageProps) {
    const params = await searchParams;

    const selectedDate = isValidDateInput(params.date)
        ? params.date!
        : getTodayInMalaysia();

    const { startIso, endIso } = getMalaysiaDateRange(selectedDate);

    const nowIso = new Date().toISOString();
    const queryStartIso = startIso > nowIso ? startIso : nowIso;

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: slots, error } = await supabase
        .from("court_slots")
        .select(
            `
        id,
        start_time,
        end_time,
        courts!inner (
          id,
          name,
          location_label,
          is_indoor,
          price_per_hour_cents
        )
      `,
        )
        .eq("is_available", true)
        .eq("courts.is_active", true)
        .gte("start_time", queryStartIso)
        .lt("start_time", endIso)
        .order("start_time", { ascending: true });

    const availableSlots = (slots ?? []) as unknown as CourtSlot[];
    const groupedSlots = Object.values(groupSlotsByTime(availableSlots));

    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
            <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Book a Picko court
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-950">
                    Choose a date and time
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Select a date to see available pickleball court times at Picko. After
                    choosing a time, you will be able to pick from the available courts.
                </p>
            </div>

            <form
                action="/bookings/new"
                method="get"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <label
                    htmlFor="date"
                    className="text-sm font-medium text-slate-700"
                >
                    Select booking date
                </label>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={selectedDate}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:max-w-xs"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Show available times
                    </button>
                </div>
            </form>

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

            <div>
                <h2 className="text-2xl font-bold text-slate-950">
                    Available times
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                    Showing available slots for{" "}
                    <span className="font-medium text-slate-900">
                        {formatSlotDate(`${selectedDate}T00:00:00+08:00`)}
                    </span>
                    .
                </p>

                {error ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                        <h3 className="font-semibold">Could not load available slots</h3>
                        <p className="mt-2 text-sm">{error.message}</p>
                    </div>
                ) : groupedSlots.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                        <h3 className="font-semibold text-slate-950">
                            No available slots for this date
                        </h3>

                        <p className="mt-2 text-sm">
                            Try choosing another date, or browse the available Picko courts before
                            checking another time.
                        </p>

                        <Link
                            href="/courts"
                            className="mt-4 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Browse courts
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-col gap-4">
                        {groupedSlots.map((group) => (
                            <article
                                key={`${group.start_time}-${group.end_time}`}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                            Available time
                                        </p>

                                        <h3 className="mt-2 text-xl font-semibold text-slate-950">
                                            {formatSlotTime(group.start_time)} -{" "}
                                            {formatSlotTime(group.end_time)}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-slate-600">
                                        {group.slots.length} court
                                        {group.slots.length === 1 ? "" : "s"} available
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    {group.slots.map((slot) => {
                                        const court = slot.courts;

                                        if (!court) {
                                            return null;
                                        }

                                        return (
                                            <div
                                                key={slot.id}
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-950">
                                                            {court.name}
                                                        </h4>

                                                        <p className="mt-1 text-sm text-slate-600">
                                                            {court.location_label ?? "Picko"}
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                        {court.is_indoor ? "Indoor" : "Outdoor"}
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-sm text-slate-600">
                                                    {formatPrice(court.price_per_hour_cents)} / hour
                                                </p>

                                                {user ? (
                                                    <Link
                                                        href={`/bookings/confirm?slotId=${slot.id}&date=${selectedDate}`}
                                                        className="mt-4 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                                                    >
                                                        Review booking
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href="/login?error=Please log in to book a court"
                                                        className="mt-4 block w-full rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
                                                    >
                                                        Log in to book
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <Link
                    href="/courts"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    Browse court details
                </Link>
            </div>
        </section>
    );
}