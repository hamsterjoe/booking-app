import Link from "next/link";
import { redirect } from "next/navigation";
import { createBooking } from "@/app/bookings/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ConfirmBookingPageProps = {
    searchParams: Promise<{
        slotId?: string;
        date?: string;
    }>;
};

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

type Profile = {
    full_name: string | null;
    phone_number: string | null;
};

function buildNewBookingRedirectPath(
    date: string,
    type: "message" | "error",
    text: string,
) {
    const params = new URLSearchParams();

    if (date) {
        params.set("date", date);
    }

    params.set(type, text);

    return `/bookings/new?${params.toString()}`;
}

function buildProfileRedirectPath(message: string, returnTo: string) {
    const params = new URLSearchParams();
    params.set("message", message);
    params.set("returnTo", returnTo);

    return `/profile?${params.toString()}`;
}

function isProfileComplete(profile: Profile | null) {
    return Boolean(profile?.full_name?.trim() && profile?.phone_number?.trim());
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

export default async function ConfirmBookingPage({
    searchParams,
}: ConfirmBookingPageProps) {
    const params = await searchParams;
    const slotId = params.slotId ?? "";
    const date = params.date ?? "";

    if (!slotId) {
        redirect(
            buildNewBookingRedirectPath(
                date,
                "error",
                "Please choose a court slot first.",
            ),
        );
    }

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=Please log in to book a court");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone_number")
        .eq("id", user.id)
        .maybeSingle();

    const currentProfile = profile as Profile | null;

    if (!isProfileComplete(currentProfile)) {
        const returnToParams = new URLSearchParams();

        returnToParams.set("slotId", slotId);

        if (date) {
            returnToParams.set("date", date);
        }

        redirect(
            buildProfileRedirectPath(
                "Please complete your profile before booking a court.",
                `/bookings/confirm?${returnToParams.toString()}`,
            ),
        );
    }

    const { data, error } = await supabase
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
        .eq("id", slotId)
        .eq("is_available", true)
        .eq("courts.is_active", true)
        .single();

    if (error || !data) {
        redirect(
            buildNewBookingRedirectPath(
                date,
                "error",
                "This slot is no longer available.",
            ),
        );
    }

    const slot = data as unknown as CourtSlot;
    const court = slot.courts;

    if (!court) {
        redirect(
            buildNewBookingRedirectPath(
                date,
                "error",
                "Court details are unavailable.",
            ),
        );
    }

    return (
        <section className="min-h-screen bg-black px-6 pb-16 pt-36 text-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <div>
                    <Link
                        href={`/bookings/new?date=${date}`}
                        className="inline-flex text-sm font-semibold text-zinc-400 transition hover:text-white"
                    >
                        ← Back to available slots
                    </Link>
                </div>

                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
                        Confirm booking
                    </p>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        {court.name}
                    </h1>

                    <p className="mt-3 text-sm text-zinc-400">
                        Picko court · {court.is_indoor ? "Indoor" : "Outdoor"}
                    </p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/40">
                    <div className="flex items-center justify-center gap-3 bg-zinc-100 px-6 py-5 text-sm font-bold text-zinc-900">
                        <span aria-hidden="true">📅</span>
                        <span>
                            {formatSlotDate(slot.start_time)} ·{" "}
                            {formatSlotTime(slot.start_time)} -{" "}
                            {formatSlotTime(slot.end_time)}
                        </span>
                    </div>

                    <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="border-b border-zinc-200 p-6 lg:border-b-0 lg:border-r lg:p-8">
                            <h2 className="text-lg font-bold text-zinc-950">
                                Booking details
                            </h2>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl bg-zinc-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                                        Date
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                                        {formatSlotDate(slot.start_time)}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-zinc-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                                        Time
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                                        {formatSlotTime(slot.start_time)} -{" "}
                                        {formatSlotTime(slot.end_time)}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-zinc-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                                        Court
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                                        {court.name}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-zinc-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                                        Court type
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                                        {court.is_indoor ? "Indoor" : "Outdoor"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
                                <div className="flex items-start gap-3">
                                    <span aria-hidden="true">ℹ️</span>
                                    <p>
                                        Your court is reserved only after you confirm this booking.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 lg:p-8">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-lg font-bold text-zinc-950">
                                    Billing summary
                                </h2>

                                <div className="group relative">
                                    <button
                                        type="button"
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500"
                                        aria-label="Booking confirmation information"
                                    >
                                        ?
                                    </button>

                                    <div className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-20 w-64 rounded-xl bg-zinc-950 px-4 py-3 text-left text-xs leading-5 text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100">
                                        Review your selected court and time before confirming.
                                        You can go back to choose another slot if needed.
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex items-center justify-between text-zinc-600">
                                    <span>{court.name}</span>
                                    <span>{formatPrice(court.price_per_hour_cents)}</span>
                                </div>

                                <div className="flex items-center justify-between text-zinc-600">
                                    <span>Duration</span>
                                    <span>1 hour</span>
                                </div>

                                <div className="flex items-center justify-between text-zinc-600">
                                    <span>Discount</span>
                                    <span>RM 0.00</span>
                                </div>

                                <div className="border-t border-zinc-200 pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-bold text-zinc-950">
                                            Total billing
                                        </span>
                                        <span className="text-xl font-bold text-zinc-950">
                                            {formatPrice(court.price_per_hour_cents)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                                You can cancel eligible bookings later from your booking
                                details page.
                            </div>

                            <form action={createBooking} className="mt-6">
                                <input type="hidden" name="slotId" value={slot.id} />
                                <input type="hidden" name="date" value={date} />

                                <SubmitButton
                                    pendingText="Confirming..."
                                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    Confirm booking ({formatPrice(court.price_per_hour_cents)})
                                </SubmitButton>
                            </form>

                            <Link
                                href={`/bookings/new?date=${date}`}
                                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100"
                            >
                                Choose another slot
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}