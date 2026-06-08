import Link from "next/link";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminBookingsPageProps = {
    searchParams: Promise<{
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

const statusOptions = ["all", "pending", "confirmed", "cancelled", "completed"];

function isValidStatus(status: string | undefined) {
    return statusOptions.includes(status ?? "all");
}

function formatPrice(cents: number) {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
    }).format(cents / 100);
}

function sortBookingsBySlotTime(bookings: Booking[]) {
    return [...bookings].sort((a, b) => {
        const aTime = a.court_slots?.start_time ?? "";
        const bTime = b.court_slots?.start_time ?? "";

        return aTime.localeCompare(bTime);
    });
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

export default async function AdminBookingsPage({
    searchParams,
}: AdminBookingsPageProps) {
    await requireAdmin();

    const params = await searchParams;
    const selectedStatus = isValidStatus(params.status) ? params.status ?? "all" : "all";

    const supabase = await createSupabaseServerClient();

    let query = supabase
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

    if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
    }

    const { data, error } = await query;

    const bookings = sortBookingsBySlotTime((data ?? []) as unknown as Booking[]);

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
                <label htmlFor="status" className="text-sm font-medium text-slate-700">
                    Filter by status
                </label>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <select
                        id="status"
                        name="status"
                        defaultValue={selectedStatus}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:max-w-xs"
                    >
                        <option value="all">All bookings</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Apply filter
                    </button>
                </div>
            </form>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    <h2 className="font-semibold">Could not load bookings</h2>
                    <p className="mt-2 text-sm">{error.message}</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                    No bookings found for this filter.
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => {
                        const slot = booking.court_slots;
                        const court = slot?.courts;

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

                                        <h2 className="mt-2 text-xl font-semibold text-slate-950">
                                            {court?.name ?? "Unknown court"}
                                        </h2>

                                        {slot ? (
                                            <p className="mt-2 text-sm text-slate-600">
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </p>
                                        ) : null}
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                                            booking.status,
                                        )}`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <p className="font-medium text-slate-900">User ID</p>
                                        <p className="break-all">{booking.user_id}</p>
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
            )}
        </section>
    );
}