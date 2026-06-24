import Link from "next/link";
import { BookingDatePicker } from "@/components/bookings/BookingDatePicker";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Court = {
    id: string;
    name: string;
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
        <section className="min-h-screen bg-black px-6 pb-16 pt-36 text-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <div>
                    <p className="text-2xl font-black uppercase tracking-wide text-blue-500">
                        Book a Picko court
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white-950">
                        Choose your next session
                    </h1>

                    <p className="mt-3 max-w-2xl text-zinc-400">
                        Select a date to see available pickleball court times at Picko. Available slots update automatically
                    </p>
                </div>

                <BookingDatePicker selectedDate={selectedDate} todayDate={getTodayInMalaysia()} />

                {params.message ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                        {params.message}
                    </div>
                ) : null}

                {params.error ? (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                        {params.error}
                    </div>
                ) : null}

                <div className="relative z-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Available slots</h2>

                            <p className="mt-2 text-sm text-zinc-400">
                                Showing available sessions for{" "}
                                <span className="font-semibold text-white">
                                    {formatSlotDate(`${selectedDate}T00:00:00+08:00`)}
                                </span>
                                .
                            </p>
                        </div>

                        <p className="text-sm text-zinc-500">
                            {availableSlots.length} slot
                            {availableSlots.length === 1 ? "" : "s"} available
                        </p>
                    </div>

                    {error ? (
                        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-100">
                            <h3 className="font-semibold">Could not load available slots</h3>
                            <p className="mt-2 text-sm text-red-200/90">{error.message}</p>
                        </div>
                    ) : groupedSlots.length === 0 ? (
                        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.07] p-6 text-zinc-300 shadow-2xl shadow-black/20 backdrop-blur-2xl">
                            <h3 className="text-lg font-semibold text-white">
                                No available slots for this date
                            </h3>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                                Try choosing another date. Stay tuned for new slots to be added later by the Picko team.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 flex flex-col gap-4">
                            {groupedSlots.map((group) => (
                                <article
                                    key={`${group.start_time}-${group.end_time}`}
                                    className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl"
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                                                Time slot
                                            </p>

                                            <h3 className="mt-2 text-xl font-bold text-white">
                                                {formatSlotTime(group.start_time)} -{" "}
                                                {formatSlotTime(group.end_time)}
                                            </h3>
                                        </div>

                                        <span className="w-fit rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-semibold text-zinc-300">
                                            {group.slots.length} court
                                            {group.slots.length === 1 ? "" : "s"} available
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {group.slots.map((slot) => {
                                            const court = slot.courts;

                                            if (!court) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={slot.id}
                                                    className="rounded-2xl border border-white/10 bg-black/30 p-3 transition hover:border-white/20 hover:bg-white/[0.08]"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <h4 className="truncate text-sm font-bold text-white">{court.name}</h4>

                                                            <p className="mt-1 text-xs text-zinc-400">
                                                                {court.is_indoor ? "Indoor" : "Outdoor"}
                                                            </p>
                                                        </div>

                                                        <span className="shrink-0 rounded-full bg-sky-400/10 px-2 py-1 text-[11px] font-bold text-sky-200">
                                                            {formatPrice(court.price_per_hour_cents)}
                                                        </span>
                                                    </div>

                                                    {user ? (
                                                        <Link
                                                            href={`/bookings/confirm?slotId=${slot.id}&date=${selectedDate}`}
                                                            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200"
                                                        >
                                                            Review booking
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            href="/login?error=Please log in to book a court"
                                                            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-400"
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
            </div>
        </section>
    );
}