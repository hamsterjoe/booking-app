import Link from "next/link";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";


type AdminBookingsPageProps = {
    searchParams: Promise<{
        date?: string;
        courtId?: string;
        status?: string;
    }>;
};

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type Booking = {
    id: string;
    user_id: string;
    status: BookingStatus;
    total_price_cents: number;
    created_at: string;
    court_slots: {
        id: string;
        start_time: string;
        end_time: string;
        courts: {
            id: string;
            name: string;
            location_label: string | null;
        } | null;
    } | null;
};

type Profile = {
    id: string;
    full_name: string | null;
    phone_number: string | null;
};

type CourtOption = {
    id: string;
    name: string;
    location_label: string | null;
};

type BookingGroup = {
    dateKey: string;
    dateLabel: string;
    bookings: Booking[];
};

const statusOptions = ["all", "pending", "confirmed", "cancelled", "completed"];

function isValidStatus(status: string | undefined) {
    return statusOptions.includes(status ?? "all");
}

function isValidDateInput(value: string | undefined) {
    if (!value) {
        return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatPrice(cents: number) {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
    }).format(cents / 100);
}

function sortBookingsBySlotTime(bookings: Booking[]) {
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
            ? formatDate(booking.court_slots.start_time)
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

function formatDate(dateTime: string) {
    return new Intl.DateTimeFormat("en-MY", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(dateTime));
}

function formatTime(dateTime: string) {
    return new Intl.DateTimeFormat("en-MY", {
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

export default async function AdminBookingsPage({
    searchParams,
}: AdminBookingsPageProps) {
    await requireAdmin();

    const params = await searchParams;

    const selectedDate = isValidDateInput(params.date) ? params.date! : "";
    const selectedCourtId = params.courtId ?? "all";
    const selectedStatus = isValidStatus(params.status) ? params.status ?? "all" : "all";

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("bookings")
        .select(
            `
        id,
        user_id,
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
            location_label
          )
        )
      `,
        )
        .order("created_at", { ascending: false });

    const { data: courtsData, error: courtsError } = await supabase
        .from("courts")
        .select("id, name, location_label")
        .order("name", { ascending: true });

    const allBookings = (data ?? []) as unknown as Booking[];
    const courtOptions = (courtsData ?? []) as CourtOption[];

    const userIds = Array.from(
        new Set(allBookings.map((booking) => booking.user_id)),
    );

    const { data: profilesData, error: profilesError } =
        userIds.length > 0
            ? await supabase
                .from("profiles")
                .select("id, full_name, phone_number")
                .in("id", userIds)
            : { data: [], error: null };

    const profiles = (profilesData ?? []) as Profile[];

    const profilesByUserId = new Map(
        profiles.map((profile) => [profile.id, profile]),
    );

    const filteredBookings = allBookings.filter((booking) => {
        const effectiveStatus = getEffectiveBookingStatus(booking);
        const bookingDateKey = getBookingDateKey(booking);
        const bookingCourtId = booking.court_slots?.courts?.id;

        const matchesStatus =
            selectedStatus === "all" || effectiveStatus === selectedStatus;

        const matchesDate =
            !selectedDate || bookingDateKey === selectedDate;

        const matchesCourt =
            selectedCourtId === "all" || bookingCourtId === selectedCourtId;

        return matchesStatus && matchesDate && matchesCourt;
    });

    const bookings = sortBookingsBySlotTime(filteredBookings);
    const bookingGroups = groupBookingsByDate(bookings);

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
                    Admin bookings
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-950">
                    View all bookings
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Review Picko court bookings across all users and booking statuses.
                </p>
            </div>

            <form
                action="/admin/bookings"
                method="get"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <h2 className="text-lg font-semibold text-slate-950">Filter bookings</h2>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div>
                        <label
                            htmlFor="date"
                            className="text-sm font-medium text-slate-700"
                        >
                            Date
                        </label>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            defaultValue={selectedDate}
                            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

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
                            htmlFor="status"
                            className="text-sm font-medium text-slate-700"
                        >
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            defaultValue={selectedStatus}
                            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="all">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Apply filters
                    </button>

                    <Link
                        href="/admin/bookings"
                        className="rounded-lg border border-slate-300 px-5 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        Reset filters
                    </Link>
                </div>
            </form>

            {error || profilesError || courtsError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    <h2 className="font-semibold">Could not load bookings</h2>
                    <p className="mt-2 text-sm">
                        {error?.message ?? profilesError?.message ?? courtsError?.message}
                    </p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                    No bookings match these filters.
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookingGroups.map((group) => (
                        <section key={group.dateKey}>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                <h2 className="text-lg font-semibold text-slate-950">
                                    {group.dateLabel}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {group.bookings.length}{" "}
                                    {group.bookings.length === 1 ? "booking" : "bookings"}
                                </p>
                            </div>

                            <div className="mt-3 grid gap-4">
                                {group.bookings.map((booking) => {
                                    const slot = booking.court_slots;
                                    const court = slot?.courts;
                                    const effectiveStatus = getEffectiveBookingStatus(booking);
                                    const profile = profilesByUserId.get(booking.user_id);

                                    return (
                                        <article
                                            key={booking.id}
                                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                                        {slot ? formatDate(slot.start_time) : "Unknown date"}
                                                    </p>

                                                    <h3 className="mt-2 text-xl font-semibold text-slate-950">
                                                        {court?.name ?? "Unknown court"}
                                                    </h3>

                                                    {slot ? (
                                                        <p className="mt-2 text-sm text-slate-600">
                                                            {formatTime(slot.start_time)} -{" "}
                                                            {formatTime(slot.end_time)}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                                                        effectiveStatus,
                                                    )}`}
                                                >
                                                    {effectiveStatus}
                                                </span>
                                            </div>

                                            <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-5">
                                                <div>
                                                    <p className="font-medium text-slate-900">Customer</p>
                                                    <p>{profile?.full_name ?? "No name provided"}</p>
                                                    <p className="mt-1 text-xs break-all text-slate-500">
                                                        {booking.user_id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-slate-900">Phone</p>
                                                    <p>{profile?.phone_number ?? "No phone provided"}</p>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-slate-900">Location</p>
                                                    <p>{court?.location_label ?? "Picko"}</p>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-slate-900">Price</p>
                                                    <p>{formatPrice(booking.total_price_cents)}</p>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-slate-900">Created</p>
                                                    <p>{formatDate(booking.created_at)}</p>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </section>
    );
}