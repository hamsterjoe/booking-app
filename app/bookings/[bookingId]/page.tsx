import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cancelBooking } from "@/app/bookings/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BookingDetailPageProps = {
    params: Promise<{
        bookingId: string;
    }>;
    searchParams: Promise<{
        returnTo?: string;
        message?: string;
        error?: string;
    }>;
};

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type Booking = {
    id: string;
    status: BookingStatus;
    total_price_cents: number;
    notes: string | null;
    created_at: string;
    court_slots: {
        id: string;
        start_time: string;
        end_time: string;
        courts: {
            id: string;
            name: string;
            location_label: string | null;
            is_indoor: boolean;
            price_per_hour_cents: number;
        } | null;
    } | null;
};

function formatPrice(cents: number) {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
    }).format(cents / 100);
}

function formatBookingDate(dateTime: string) {
    return new Intl.DateTimeFormat("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(dateTime));
}

function formatBookingTime(dateTime: string) {
    return new Intl.DateTimeFormat("en-MY", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(dateTime));
}

function formatDateTime(dateTime: string) {
    return new Intl.DateTimeFormat("en-MY", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(dateTime));
}

function getStatusLabel(status: BookingStatus) {
    if (status === "confirmed") {
        return "Upcoming";
    }

    if (status === "pending") {
        return "Pending";
    }

    if (status === "completed") {
        return "Completed";
    }

    return "Cancelled";
}

function getStatusTheme(status: BookingStatus) {
    if (status === "confirmed") {
        return {
            pageAccent: "from-emerald-500/20 via-transparent to-transparent",
            cardAccent: "border-l-4 border-l-lime-400",
            pill: "bg-lime-400/25 text-lime-800 ring-1 ring-lime-400/50",
            dot: "bg-lime-400",
        };
    }

    if (status === "pending") {
        return {
            pageAccent: "from-amber-500/20 via-transparent to-transparent",
            cardAccent: "border-l-4 border-l-amber-400",
            pill: "bg-amber-400/25 text-amber-800 ring-1 ring-amber-400/50",
            dot: "bg-amber-400",
        };
    }

    if (status === "completed") {
        return {
            pageAccent: "from-sky-500/20 via-transparent to-transparent",
            cardAccent: "border-l-4 border-l-sky-400",
            pill: "bg-sky-400/25 text-sky-800 ring-1 ring-sky-400/50",
            dot: "bg-sky-400",
        };
    }

    return {
        pageAccent: "from-red-500/20 via-transparent to-transparent",
        cardAccent: "border-l-4 border-l-red-400",
        pill: "bg-red-500/10 text-red-700 ring-1 ring-red-500/20",
        dot: "bg-red-400",
    };
}

function DetailItem({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl p-4 ${
                highlight
                    ? "border border-blue-500 bg-sky-50"
                    : "bg-zinc-50"
            }`}
        >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </p>
            <p
                className={`mt-2 text-sm font-semibold ${
                    highlight ? "break-all text-blue-950" : "text-zinc-950"
                }`}
            >
                {value}
            </p>
        </div>
    );
}

function isActiveBooking(status: BookingStatus) {
    return status === "pending" || status === "confirmed";
}

function getEffectiveBookingStatus(booking: Booking): BookingStatus {
    if (booking.status !== "confirmed") {
        return booking.status;
    }

    const endTime = booking.court_slots?.end_time;

    if (!endTime) {
        return booking.status;
    }

    const hasEnded = new Date(endTime).getTime() < Date.now();

    return hasEnded ? "completed" : booking.status;
}

function canCancelBooking(booking: Booking) {
    const startTime = booking.court_slots?.start_time;

    if (!startTime) {
        return false;
    }

    const sixHoursFromNow = Date.now() + 6 * 60 * 60 * 1000;

    return (
        isActiveBooking(booking.status) &&
        new Date(startTime).getTime() > sixHoursFromNow
    );
}

function isWithinCancellationCutoff(booking: Booking) {
    const startTime = booking.court_slots?.start_time;

    if (!startTime) {
        return false;
    }

    return (
        isActiveBooking(booking.status) &&
        new Date(startTime).getTime() > Date.now() &&
        !canCancelBooking(booking)
    );
}

export default async function BookingDetailPage({
    params,
    searchParams,
}: BookingDetailPageProps) {
    const { bookingId } = await params;

    const resolvedSearchParams = await searchParams;

    const backHref = resolvedSearchParams.returnTo?.startsWith("/bookings")
        ? resolvedSearchParams.returnTo
        : "/bookings";

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login?error=Please log in to view your booking");
    }

    const { data, error } = await supabase
        .from("bookings")
        .select(
            `
        id,
        status,
        total_price_cents,
        notes,
        created_at,
        court_slots (
          id,
          start_time,
          end_time,
          courts (
            id,
            name,
            location_label,
            is_indoor,
            price_per_hour_cents
          )
        )
      `,
        )
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .single();

    if (error || !data) {
        notFound();
    }

    const booking = data as unknown as Booking;
    const slot = booking.court_slots;
    const court = slot?.courts;
    const effectiveStatus = getEffectiveBookingStatus(booking);
    const statusTheme = getStatusTheme(effectiveStatus);

    return (
        <section className="relative min-h-screen overflow-hidden bg-black px-6 pb-16 pt-36 text-white">
            <div
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 -z-0 h-96 bg-gradient-to-b ${statusTheme.pageAccent}`}
            />
    
            <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8">
                <div>
                    <Link
                        href={backHref}
                        className="inline-flex text-sm font-semibold text-zinc-400 transition hover:text-white"
                    >
                        ← Back to my bookings
                    </Link>
                </div>
    
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
                        Booking details
                    </p>
    
                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Your Picko booking
                    </h1>
    
                    <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
                        Full summary of your court, time, payment amount, and booking reference.
                    </p>
                </div>
    
                {resolvedSearchParams.message ? (
                    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                        {resolvedSearchParams.message}
                    </div>
                ) : null}
    
                {resolvedSearchParams.error ? (
                    <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                        {resolvedSearchParams.error}
                    </div>
                ) : null}
    
                <article
                    className={`overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl shadow-black/40 backdrop-blur-2xl ${statusTheme.cardAccent}`}
                >
                    <div className="border-b border-zinc-200 bg-zinc-100/80 px-6 py-5 backdrop-blur">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${statusTheme.dot}`}
                                    />
    
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusTheme.pill}`}
                                    >
                                        {getStatusLabel(effectiveStatus)}
                                    </span>
    
                                    <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white">
                                        {formatPrice(booking.total_price_cents)}
                                    </span>
                                </div>
    
                                <h2 className="mt-3 truncate text-2xl font-bold text-zinc-950">
                                    {court?.name ?? "Picko court"}
                                </h2>
    
                                {slot ? (
                                    <p className="mt-2 text-sm font-medium text-zinc-600">
                                        {formatBookingDate(slot.start_time)} ·{" "}
                                        {formatBookingTime(slot.start_time)} -{" "}
                                        {formatBookingTime(slot.end_time)}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-sm font-medium text-zinc-600">
                                        Slot details unavailable
                                    </p>
                                )}
                            </div>
    
                            <Link
                                href="/bookings/new"
                                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
                            >
                                Book another court
                            </Link>
                        </div>
                    </div>
    
                    <div className="grid gap-8 p-6 lg:p-8">
                        <section>
                            <h3 className="text-lg font-bold text-zinc-950">
                                Booking summary
                            </h3>
    
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <DetailItem
                                    label="Status"
                                    value={getStatusLabel(effectiveStatus)}
                                />
    
                                <DetailItem
                                    label="Price"
                                    value={formatPrice(booking.total_price_cents)}
                                />
    
                                <DetailItem
                                    label="Created"
                                    value={formatDateTime(booking.created_at)}
                                />
    
                                <DetailItem
                                    label="Booking ID"
                                    value={booking.id}
                                    highlight
                                />
                            </div>
                        </section>
    
                        <section>
                            <h3 className="text-lg font-bold text-zinc-950">
                                Slot details
                            </h3>
    
                            {slot ? (
                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <DetailItem
                                        label="Date"
                                        value={formatBookingDate(slot.start_time)}
                                    />
    
                                    <DetailItem
                                        label="Time"
                                        value={`${formatBookingTime(
                                            slot.start_time,
                                        )} - ${formatBookingTime(slot.end_time)}`}
                                    />
    
                                    <DetailItem
                                        label="Slot ID"
                                        value={slot.id}
                                        highlight
                                    />
                                </div>
                            ) : (
                                <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
                                    Slot details are unavailable.
                                </div>
                            )}
                        </section>
    
                        <section>
                            <h3 className="text-lg font-bold text-zinc-950">
                                Court details
                            </h3>
    
                            {court ? (
                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <DetailItem label="Court" value={court.name} />
    
                                    <DetailItem
                                        label="Location"
                                        value={court.location_label ?? "Picko"}
                                    />
    
                                    <DetailItem
                                        label="Court type"
                                        value={court.is_indoor ? "Indoor" : "Outdoor"}
                                    />
    
                                    <DetailItem
                                        label="Court price"
                                        value={`${formatPrice(
                                            court.price_per_hour_cents,
                                        )} / hour`}
                                    />
                                </div>
                            ) : (
                                <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
                                    Court details are unavailable.
                                </div>
                            )}
                        </section>
    
                        {booking.notes ? (
                            <section>
                                <h3 className="text-lg font-bold text-zinc-950">
                                    Booking notes
                                </h3>
    
                                <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                                    {booking.notes}
                                </div>
                            </section>
                        ) : null}
    
                        <section className="border-t border-zinc-200 pt-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Link
                                    href={backHref}
                                    className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100"
                                >
                                    Back to my bookings
                                </Link>
    
                                {canCancelBooking(booking) ? (
                                    <form action={cancelBooking} className="sm:min-w-52">
                                        <input
                                            type="hidden"
                                            name="bookingId"
                                            value={booking.id}
                                        />
                                        <input
                                            type="hidden"
                                            name="redirectTarget"
                                            value="detail"
                                        />
    
                                        <SubmitButton
                                            pendingText="Cancelling..."
                                            variant="danger"
                                            className="w-full rounded-xl border-2 border-red-500 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:border-red-200 disabled:bg-red-50 disabled:text-red-300"
                                        >
                                            Cancel booking
                                        </SubmitButton>
                                    </form>
                                ) : null}
                            </div>
                        </section>
                    </div>
                </article>
            </div>
        </section>
    );
}