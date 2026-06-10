import Link from "next/link";
import { notFound } from "next/navigation";
import { adminCancelBooking, updateAdminBookingNotes } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminBookingDetailPageProps = {
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
    user_id: string;
    status: BookingStatus;
    total_price_cents: number;
    notes: string | null;
    created_at: string;
    court_slots: {
        id: string;
        start_time: string;
        end_time: string;
        is_available: boolean;
        courts: {
            id: string;
            name: string;
            description: string | null;
            location_label: string | null;
            is_indoor: boolean;
            price_per_hour_cents: number;
            is_active: boolean;
        } | null;
    } | null;
};

type Profile = {
    id: string;
    full_name: string | null;
    phone_number: string | null;
};

function formatPrice(cents: number) {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
    }).format(cents / 100);
}

function formatDate(dateTime: string) {
    return new Intl.DateTimeFormat("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "long",
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

function canAdminCancelBooking(booking: Booking) {
    return booking.status === "pending" || booking.status === "confirmed";
}

function getAdminCancellationMessage(booking: Booking) {
    const effectiveStatus = getEffectiveBookingStatus(booking);

    if (booking.status === "cancelled") {
        return "This booking has already been cancelled.";
    }

    if (effectiveStatus === "completed") {
        return "This booking is completed and cannot be cancelled.";
    }

    return "Only pending or confirmed bookings can be cancelled.";
}

export default async function AdminBookingDetailPage({
    params,
    searchParams
}: AdminBookingDetailPageProps) {
    await requireAdmin();

    const { bookingId } = await params;
    const supabase = await createSupabaseServerClient();

    const resolvedSearchParams = await searchParams;

    const backHref = resolvedSearchParams.returnTo?.startsWith("/admin/bookings")
        ? resolvedSearchParams.returnTo
        : "/admin/bookings";

    const { data, error } = await supabase
        .from("bookings")
        .select(
            `
        id,
        user_id,
        status,
        total_price_cents,
        notes,
        created_at,
        court_slots (
          id,
          start_time,
          end_time,
          is_available,
          courts (
            id,
            name,
            description,
            location_label,
            is_indoor,
            price_per_hour_cents,
            is_active
          )
        )
      `,
        )
        .eq("id", bookingId)
        .single();

    if (error || !data) {
        notFound();
    }

    const booking = data as unknown as Booking;
    const slot = booking.court_slots;
    const court = slot?.courts;
    const effectiveStatus = getEffectiveBookingStatus(booking);

    const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone_number")
        .eq("id", booking.user_id)
        .maybeSingle();

    const profile = profileData as Profile | null;

    return (
        <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
            <div>
                <Link
                    href={backHref}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to bookings
                </Link>

                <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Admin booking details
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-slate-950">
                        Booking details
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
                    Review this Picko booking, customer, court, and slot information.
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

            {profileError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Could not load customer profile: {profileError.message}
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">
                        Booking summary
                    </h2>

                    <form action={updateAdminBookingNotes} className="mt-6">
                        <input type="hidden" name="bookingId" value={booking.id} />

                        <label
                            htmlFor="notes"
                            className="text-sm font-medium text-slate-900"
                        >
                            Admin notes
                        </label>

                        <textarea
                            id="notes"
                            name="notes"
                            rows={4}
                            defaultValue={booking.notes ?? ""}
                            placeholder="Add internal notes about this booking..."
                            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            These notes are for admin use only.
                        </p>

                        <div className="mt-4">
                            <SubmitButton pendingText="Saving notes..." variant="secondary">
                                Save notes
                            </SubmitButton>
                        </div>
                    </form>

                    <div className="mt-5 grid gap-4 text-sm text-slate-600">
                        <div>
                            <p className="font-medium text-slate-900">Stored status</p>
                            <p className="capitalize">{booking.status}</p>
                        </div>

                        <div>
                            <p className="font-medium text-slate-900">Effective status</p>
                            <p className="capitalize">{effectiveStatus}</p>
                        </div>

                        <div>
                            <p className="font-medium text-slate-900">Booking price</p>
                            <p>{formatPrice(booking.total_price_cents)}</p>
                        </div>

                        <div>
                            <p className="font-medium text-slate-900">Created</p>
                            <p>{formatDateTime(booking.created_at)}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">Customer</h2>

                    <div className="mt-5 grid gap-4 text-sm text-slate-600">
                        <div>
                            <p className="font-medium text-slate-900">Name</p>
                            <p>{profile?.full_name ?? "No name provided"}</p>
                        </div>

                        <div>
                            <p className="font-medium text-slate-900">Phone</p>
                            <p>{profile?.phone_number ?? "No phone provided"}</p>
                        </div>

                        <div>
                            <p className="font-medium text-slate-900">User ID</p>
                            <p className="break-all">{booking.user_id}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">Admin actions</h2>

                <div className="mt-5 text-sm text-slate-600">
                    {canAdminCancelBooking(booking) ? (
                        <div className="space-y-4">
                            <div className="rounded-xl bg-red-50 p-4 text-red-700">
                                Cancelling this booking will mark it as cancelled and make the
                                slot available again.
                            </div>

                            <form action={adminCancelBooking}>
                                <input type="hidden" name="bookingId" value={booking.id} />

                                <SubmitButton
                                    pendingText="Cancelling booking..."
                                    variant="danger"
                                >
                                    Cancel booking
                                </SubmitButton>
                            </form>
                        </div>
                    ) : (
                        <div className="rounded-xl bg-slate-100 p-4 text-slate-700">
                            {getAdminCancellationMessage(booking)}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">Slot</h2>

                    {slot ? (
                        <div className="mt-5 grid gap-4 text-sm text-slate-600">
                            <div>
                                <p className="font-medium text-slate-900">Date</p>
                                <p>{formatDate(slot.start_time)}</p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">Time</p>
                                <p>
                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">Slot availability</p>
                                <p>{slot.is_available ? "Available" : "Unavailable"}</p>
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
                    <h2 className="text-lg font-semibold text-slate-950">Court</h2>

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

                            <div>
                                <p className="font-medium text-slate-900">Court status</p>
                                <p>{court.is_active ? "Active" : "Inactive"}</p>
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">Description</p>
                                <p>{court.description ?? "No description provided."}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-5 text-sm text-slate-600">
                            Court details are unavailable.
                        </p>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                    System details
                </h2>

                <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                        <p className="font-medium text-slate-900">Booking ID</p>
                        <p className="break-all">{booking.id}</p>
                    </div>

                    <div>
                        <p className="font-medium text-slate-900">User ID</p>
                        <p className="break-all">{booking.user_id}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}