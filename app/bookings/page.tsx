import Link from "next/link";
import { redirect } from "next/navigation";
import { cancelBooking } from "@/app/bookings/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Court = {
    id: string;
    name: string;
    location_label: string | null;
    is_indoor: boolean;
};

type CourtSlot = {
    id: string;
    start_time: string;
    end_time: string;
    courts: Court | null;
};

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type Booking = {
    id: string;
    status: BookingStatus;
    total_price_cents: number;
    created_at: string;
    court_slots: CourtSlot | null;
};

type BookingGroup = {
    dateKey: string;
    dateLabel: string;
    bookings: Booking[];
};

type BookingsPageProps = {
    searchParams: Promise<{
        message?: string;
        error?: string;
    }>;
};

function formatPrice(cents: number) {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
    }).format(cents / 100);
}

function isActiveBooking(status: Booking["status"]) {
    return status === "pending" || status === "confirmed";
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

function getStatusClasses(status: Booking["status"]) {
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

function sortBookingsByStartTime(bookings: Booking[]) {
    return [...bookings].sort((a, b) => {
        const aTime = a.court_slots?.start_time;
        const bTime = b.court_slots?.start_time;

        if (!aTime && !bTime) {
            return b.created_at.localeCompare(a.created_at);
        }

        if (!aTime) {
            return 1;
        }

        if (!bTime) {
            return -1;
        }

        return aTime.localeCompare(bTime);
    });
}

function getBookingDateKey(booking: Booking) {
    const startTime = booking.court_slots?.start_time;

    if (!startTime) {
        return "unknown";
    }

    return new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(startTime));
}

function groupBookingsByDate(bookings: Booking[]) {
    const groups: BookingGroup[] = [];

    for (const booking of bookings) {
        const dateKey = getBookingDateKey(booking);
        const dateLabel = booking.court_slots
            ? formatBookingDate(booking.court_slots.start_time)
            : "Unknown date";

        const existingGroup = groups.find((group) => group.dateKey === dateKey);

        if (existingGroup) {
            existingGroup.bookings.push(booking);
        } else {
            groups.push({
                dateKey,
                dateLabel,
                bookings: [booking],
            });
        }
    }

    return groups;
}

function BookingCard({ booking }: { booking: Booking }) {
    const slot = booking.court_slots;
    const court = slot?.courts;
    const effectiveStatus = getEffectiveBookingStatus(booking);

    if (!slot || !court) {
        return (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                Booking details are unavailable.
            </article>
        );
    }

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        {formatBookingDate(slot.start_time)}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-slate-950">
                        {formatBookingTime(slot.start_time)} -{" "}
                        {formatBookingTime(slot.end_time)}
                    </h3>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                        effectiveStatus,
                    )}`}
                >
                    {effectiveStatus}
                </span>
            </div>

            <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
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
                    <p className="font-medium text-slate-900">Price</p>
                    <p>{formatPrice(booking.total_price_cents)}</p>
                </div>
            </div>

            {canCancelBooking(booking) ? (
                <form action={cancelBooking} className="mt-5">
                    <input type="hidden" name="bookingId" value={booking.id} />

                    <SubmitButton pendingText="Cancelling..." variant="danger" className="w-full">
                        Cancel booking
                    </SubmitButton>
                </form>

            ) : isWithinCancellationCutoff(booking) ? (
                <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    This booking can no longer be cancelled because it starts within 6 hours.
                </p>
            ) : null}

        </article>
    );
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
    const params = await searchParams;

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=Please log in to view your bookings");
    }

    const { data, error } = await supabase
        .from("bookings")
        .select(
            `
        id,
        status,
        total_price_cents,
        created_at,
        court_slots (
          id,
          start_time,
          end_time,
          courts (
            id,
            name,
            location_label,
            is_indoor
          )
        )
      `,
        )
        .eq("user_id", user.id);

    const bookings = sortBookingsByStartTime((data ?? []) as unknown as Booking[]);
    const now = new Date();

    const upcomingBookings = bookings.filter((booking) => {
        const startTime = booking.court_slots?.start_time;
        const effectiveStatus = getEffectiveBookingStatus(booking);

        if (!startTime) {
            return false;
        }

        return (
            new Date(startTime) >= now &&
            effectiveStatus !== "cancelled" &&
            effectiveStatus !== "completed"
        );
    });

    const pastBookings = bookings.filter((booking) => {
        const startTime = booking.court_slots?.start_time;
        const effectiveStatus = getEffectiveBookingStatus(booking);

        if (!startTime) {
            return true;
        }

        return (
            new Date(startTime) < now ||
            effectiveStatus === "cancelled" ||
            effectiveStatus === "completed"
        );
    });

    const upcomingBookingGroups = groupBookingsByDate(upcomingBookings);
    const pastBookingGroups = groupBookingsByDate(pastBookings);

    if (error) {
        return (
            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    <h1 className="text-xl font-semibold">Could not load bookings</h1>
                    <p className="mt-2 text-sm">{error.message}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                Cancellations are allowed up to 6 hours before your court time.
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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        My bookings
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-950">
                        Your Picko court bookings
                    </h1>

                    <p className="mt-3 max-w-2xl text-slate-600">
                        View your upcoming court bookings and booking history.
                    </p>
                </div>

                <Link
                    href="/bookings/new"
                    className="rounded-lg bg-blue-600 px-5 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                    Book another court
                </Link>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-950">
                    Upcoming bookings
                </h2>

                {upcomingBookings.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                        You do not have any upcoming bookings.
                    </div>
                ) : (
                    <div className="mt-6 grid gap-6">
                        {upcomingBookingGroups.map((group) => (
                            <section key={group.dateKey}>
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                    <h3 className="text-lg font-semibold text-slate-950">
                                        {group.dateLabel}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {group.bookings.length}{" "}
                                        {group.bookings.length === 1 ? "booking" : "bookings"}
                                    </p>
                                </div>

                                <div className="mt-3 grid gap-4">
                                    {group.bookings.map((booking) => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-950">
                    Booking history
                </h2>

                {pastBookings.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                        Your past bookings will appear here.
                    </div>
                ) : (
                    <div className="mt-6 grid gap-6">
                        {pastBookingGroups.map((group) => (
                            <section key={group.dateKey}>
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                    <h3 className="text-lg font-semibold text-slate-950">
                                        {group.dateLabel}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {group.bookings.length}{" "}
                                        {group.bookings.length === 1 ? "booking" : "bookings"}
                                    </p>
                                </div>

                                <div className="mt-3 grid gap-4">
                                    {group.bookings.map((booking) => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}