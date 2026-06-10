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

function getStatusClasses(status: BookingStatus) {
    if (status === "confirmed") {
        return "bg-green-50 text-green-700";
    }

    if (status === "pending") {
        return "bg-yellow-50 text-yellow-700";
    }

    if (status === "cancelled") {
        return "bg-red-50 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
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

    return (
        <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
            <div>
                <Link
                    href={backHref}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to my bookings
                </Link>

                <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Booking details
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-slate-950">
                        Your Picko booking
                    </h1>

                    <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            effectiveStatus,
                        )}`}
                    >
                        {effectiveStatus}
                    </span>
                </div>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Review your court, time, price, and booking status.
                </p>
            </div>

            {resolvedSearchParams.message ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {resolvedSearchParams.message}
                </div>
            ) : null}

            {resolvedSearchParams.error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {resolvedSearchParams.error}
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">
                        Booking summary
                    </h2>

                    <div className="mt-5 grid gap-4 text-sm text-slate-600">
                        <div>
                            <p className="font-medium text-slate-900">Status</p>
                            <p className="capitalize">{effectiveStatus}</p>
                        </div>

                        <div>
                            <p className="font-medium text-slate-900">Price</p>
                            <p>{formatPrice(booking.total_price_cents)}</p>
                        </div>

                        <div>
                            <p className="font-medium text-slate-900">Created</p>
                            <p>{formatDateTime(booking.created_at)}</p>
                        </div>

                        <div>
                            <p className="font-medium text-slate-900">Booking ID</p>
                            <p className="break-all">{booking.id}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">
                        Cancellation
                    </h2>

                    <div className="mt-5 text-sm text-slate-600">
                        {canCancelBooking(booking) ? (
                            <div className="space-y-4">
                                <div className="rounded-xl bg-green-50 p-4 text-green-700">
                                    This booking is still eligible for cancellation.
                                </div>

                                <form action={cancelBooking}>
                                    <input type="hidden" name="bookingId" value={booking.id} />
                                    <input type="hidden" name="redirectTarget" value="detail" />

                                    <SubmitButton
                                        pendingText="Cancelling..."
                                        variant="danger"
                                        className="w-full"
                                    >
                                        Cancel booking
                                    </SubmitButton>
                                </form>
                            </div>
                        ) : isWithinCancellationCutoff(booking) ? (
                            <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">
                                This booking can no longer be cancelled because it starts
                                within 6 hours.
                            </div>
                        ) : effectiveStatus === "cancelled" ? (
                            <div className="rounded-xl bg-red-50 p-4 text-red-700">
                                This booking has been cancelled.
                            </div>
                        ) : effectiveStatus === "completed" ? (
                            <div className="rounded-xl bg-slate-100 p-4 text-slate-700">
                                This booking is completed.
                            </div>
                        ) : (
                            <div className="rounded-xl bg-slate-100 p-4 text-slate-700">
                                Cancellation is not available for this booking.
                            </div>
                        )}

                        <p className="mt-4">
                            Cancellations are allowed up to 6 hours before your court time.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">
                        Slot details
                    </h2>

                    {slot ? (
                        <div className="mt-5 grid gap-4 text-sm text-slate-600">
                            <div>
                                <p className="font-medium text-slate-900">Date</p>
                                <p>{formatBookingDate(slot.start_time)}</p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">Time</p>
                                <p>
                                    {formatBookingTime(slot.start_time)} -{" "}
                                    {formatBookingTime(slot.end_time)}
                                </p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">Slot ID</p>
                                <p className="break-all">{slot.id}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-5 text-sm text-slate-600">
                            Slot details are unavailable.
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">
                        Court details
                    </h2>

                    {court ? (
                        <div className="mt-5 grid gap-4 text-sm text-slate-600">
                            <div>
                                <p className="font-medium text-slate-900">Court</p>
                                <p>{court.name}</p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">Location</p>
                                <p>{court.location_label ?? "Picko"}</p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">Court type</p>
                                <p>{court.is_indoor ? "Indoor" : "Outdoor"}</p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">Court price</p>
                                <p>{formatPrice(court.price_per_hour_cents)} / hour</p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-5 text-sm text-slate-600">
                            Court details are unavailable.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                    href={backHref}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                    Back to my bookings
                </Link>

                <Link
                    href="/bookings/new"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                    Book another court
                </Link>
            </div>
        </section>
    );
}