import Link from "next/link";
import { redirect } from "next/navigation";
import { cancelBooking } from "@/app/bookings/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Court = {
    id: string;
    name: string;
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

type BookingFilter = "all" | "upcoming" | "completed" | "cancelled";

type BookingsPageProps = {
    searchParams: Promise<{
        message?: string;
        error?: string;
        filter?: string;
    }>;
};

const bookingFilters: BookingFilter[] = [
    "all",
    "upcoming",
    "completed",
    "cancelled",
];

const bookingFilterLabels: Record<BookingFilter, string> = {
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
    all: "All",
};

function getSelectedBookingFilter(filter: string | undefined): BookingFilter {
    if (bookingFilters.includes(filter as BookingFilter)) {
        return filter as BookingFilter;
    }
    return "upcoming";
}

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

function getBookingCategory(booking: Booking): Exclude<BookingFilter, "all"> {
    const effectiveStatus = getEffectiveBookingStatus(booking);

    if (effectiveStatus === "cancelled") {
        return "cancelled";
    }

    if (effectiveStatus === "completed") {
        return "completed";
    }

    return "upcoming";
}

function getStatusLabel(booking: Booking) {
    const effectiveStatus = getEffectiveBookingStatus(booking);

    if (effectiveStatus === "confirmed") {
        return "Upcoming";
    }

    if (effectiveStatus === "pending") {
        return "Pending";
    }

    if (effectiveStatus === "completed") {
        return "Completed";
    }

    return "Cancelled";
}

function getStatusTheme(category: Exclude<BookingFilter, "all">) {
    if (category === "upcoming") {
        return {
            card: "border-l-4 border-l-lime-400",
            pill: "bg-lime-400/25 text-lime-800 ring-1 ring-lime-400/50",
            dot: "bg-lime-400",
        };
    }

    if (category === "completed") {
        return {
            card: "border-l-4 border-l-sky-400",
            pill: "bg-sky-400/25 text-sky-800 ring-1 ring-sky-400/50",
            dot: "bg-sky-400",
        };
    }

    return {
        card: "border-l-4 border-l-red-400",
        pill: "bg-red-500/10 text-red-700 ring-1 ring-red-500/20",
        dot: "bg-red-400",
    };
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

function BookingCard({
    booking,
    returnTo,
}: {
    booking: Booking;
    returnTo: string;
}) {
    const slot = booking.court_slots;
    const court = slot?.courts;
    const category = getBookingCategory(booking);
    const theme = getStatusTheme(category);

    if (!slot || !court) {
        return (
            <article className="rounded-2xl border border-white/20 bg-white/95 p-5 text-zinc-600 shadow-xl shadow-black/20 backdrop-blur-2xl">
                Booking details are unavailable.
            </article>
        );
    }

    return (
        <article
            className={`rounded-2xl border border-white/30 bg-white/95 p-5 shadow-xl shadow-black/20 backdrop-blur-2xl ${theme.card}`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${theme.pill}`}
                        >
                            {getStatusLabel(booking)}
                        </span>

                        <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white">
                            {formatPrice(booking.total_price_cents)}
                        </span>
                    </div>

                    <h3 className="mt-3 truncate text-lg font-bold text-zinc-950">
                        {court.name}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-zinc-600">
                        {formatBookingDate(slot.start_time)}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                        {formatBookingTime(slot.start_time)} -{" "}
                        {formatBookingTime(slot.end_time)} ·{" "}
                        {court.is_indoor ? "Indoor" : "Outdoor"}
                    </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:w-40">
                    <Link
                        href={`/bookings/${booking.id}?returnTo=${encodeURIComponent(returnTo)}`}
                        className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
                    >
                        View details
                    </Link>

                    {canCancelBooking(booking) ? (
                        <form action={cancelBooking}>
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <SubmitButton
                                pendingText="Cancelling..."
                                variant="danger"
                                className="w-full rounded-xl border-2 border-red-500 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:border-red-200 disabled:bg-red-50 disabled:text-red-300"
                            >
                                Cancel
                            </SubmitButton>
                        </form>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function BookingGroupList({
    groups,
    emptyText,
    returnTo,
    actionHref,
    actionLabel,
}: {
    groups: BookingGroup[];
    emptyText: string;
    returnTo: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    if (groups.length === 0) {
        return (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.07] p-6 text-zinc-300 shadow-2xl shadow-black/20 backdrop-blur-2xl">
                <p className="text-sm">{emptyText}</p>

                {actionHref && actionLabel ? (
                    <Link
                        href={actionHref}
                        className="mt-4 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
                    >
                        {actionLabel}
                    </Link>
                ) : null}
            </div>
        );
    }

    return (
        <div className="mt-5 grid gap-6">
            {groups.map((group) => (
                <section key={group.dateKey}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <h3 className="text-lg font-bold text-white">
                            {group.dateLabel}
                        </h3>

                        <p className="text-sm text-zinc-500">
                            {group.bookings.length}{" "}
                            {group.bookings.length === 1 ? "booking" : "bookings"}
                        </p>
                    </div>

                    <div className="mt-3 grid gap-3">
                        {group.bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                returnTo={returnTo}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
    const params = await searchParams;
    const selectedFilter = getSelectedBookingFilter(params.filter);

    const returnTo =
        selectedFilter === "upcoming"
            ? "/bookings"
            : `/bookings?filter=${selectedFilter}`;

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=Please log in to view your bookings");
    }

    const historyStartDate = new Date();
    historyStartDate.setDate(historyStartDate.getDate() - 90);
    const historyStartIso = historyStartDate.toISOString();

    const { data, error } = await supabase
        .from("bookings")
        .select(
            `
    id,
    status,
    total_price_cents,
    created_at,
    court_slots!inner (
      id,
      start_time,
      end_time,
      courts (
        id,
        name,
        is_indoor
      )
    )
  `,
        )
        .eq("user_id", user.id)
        .gte("court_slots.start_time", historyStartIso);

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

    const completedBookings = bookings.filter(
        (booking) => getEffectiveBookingStatus(booking) === "completed",
    );

    const cancelledBookings = bookings.filter(
        (booking) => getEffectiveBookingStatus(booking) === "cancelled",
    );

    const upcomingBookingGroups = groupBookingsByDate(upcomingBookings);
    const completedBookingGroups = groupBookingsByDate(completedBookings);
    const cancelledBookingGroups = groupBookingsByDate(cancelledBookings);

    if (error) {
        return (
            <section className="min-h-screen bg-black px-6 pb-16 pt-36 text-white">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-red-100">
                        <h1 className="text-xl font-bold">Could not load bookings</h1>
                        <p className="mt-2 text-sm text-red-200/90">{error.message}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-black px-6 pb-16 pt-36 text-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <ToastMessage message={params.message} error={params.error} />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
                                My bookings
                            </p>

                            <div className="group relative">
                                <button
                                    type="button"
                                    aria-label="Cancellation policy"
                                    className="flex h-6 w-6 items-center justify-center rounded-full border border-sky-300/30 bg-sky-400/10 text-xs font-black text-sky-100 transition hover:bg-sky-400/20"
                                >
                                    i
                                </button>

                                <div className="pointer-events-none absolute left-1/2 top-[calc(100%+0.75rem)] z-30 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-950/95 px-4 py-3 text-left text-xs leading-5 text-zinc-200 opacity-0 shadow-2xl shadow-black/40 backdrop-blur-2xl transition group-hover:opacity-100">
                                    Cancellations are allowed up to 6 hours before your court time.
                                </div>
                            </div>
                        </div>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Your Picko bookings
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                            View upcoming sessions and recent booking history from the last
                            90 days.
                        </p>
                    </div>

                    <Link
                        href="/bookings/new"
                        className="h-fit rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
                    >
                        Book another court
                    </Link>
                </div>

                <nav
                    aria-label="Booking filters"
                    className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.08] p-1 shadow-2xl shadow-black/20 backdrop-blur-2xl"
                >
                    <div className="grid grid-cols-4 gap-1">
                        {bookingFilters.map((filter) => {
                            const isActive = selectedFilter === filter;
                            const href =
                                filter === "upcoming"
                                    ? "/bookings"
                                    : `/bookings?filter=${filter}`;

                            return (
                                <Link
                                    key={filter}
                                    href={href}
                                    className={`rounded-xl px-2 py-2.5 text-center text-xs font-bold transition sm:px-4 sm:text-sm ${isActive
                                        ? "bg-white text-zinc-950 shadow-lg shadow-black/20"
                                        : "text-zinc-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {bookingFilterLabels[filter]}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {selectedFilter === "all" ? (
                    <div className="grid gap-10">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Upcoming
                            </h2>

                            <BookingGroupList
                                groups={upcomingBookingGroups}
                                emptyText="You do not have any upcoming bookings."
                                returnTo={returnTo}
                                actionHref="/bookings/new"
                                actionLabel="Book a court"
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Completed
                            </h2>

                            <BookingGroupList
                                groups={completedBookingGroups}
                                emptyText="You do not have any completed bookings from the last 90 days."
                                returnTo={returnTo}
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Cancelled
                            </h2>

                            <BookingGroupList
                                groups={cancelledBookingGroups}
                                emptyText="You do not have any cancelled bookings from the last 90 days."
                                returnTo={returnTo}
                            />
                        </div>
                    </div>
                ) : selectedFilter === "upcoming" ? (
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Upcoming
                        </h2>

                        <BookingGroupList
                            groups={upcomingBookingGroups}
                            emptyText="You do not have any upcoming bookings."
                            returnTo={returnTo}
                            actionHref="/bookings/new"
                            actionLabel="Book a court"
                        />
                    </div>
                ) : selectedFilter === "completed" ? (
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Completed
                        </h2>

                        <BookingGroupList
                            groups={completedBookingGroups}
                            emptyText="You do not have any completed bookings from the last 90 days."
                            returnTo={returnTo}
                            actionHref="/bookings/new"
                            actionLabel="Book a court"
                        />
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Cancelled
                        </h2>

                        <BookingGroupList
                            groups={cancelledBookingGroups}
                            emptyText="You do not have any cancelled bookings from the last 90 days."
                            returnTo={returnTo}
                            actionHref="/bookings/new"
                            actionLabel="Book a court"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}