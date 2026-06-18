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
          location_label,
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
        <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
            <div>
                <Link
                    href={`/bookings/new?date=${date}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to available times
                </Link>

                <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Confirm booking
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-950">
                    Review your court booking
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Check the details below before confirming your Picko court
                    booking.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">
                    Booking details
                </h2>

                <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                        <p className="font-medium text-slate-900">Date</p>
                        <p>{formatSlotDate(slot.start_time)}</p>
                    </div>

                    <div>
                        <p className="font-medium text-slate-900">Time</p>
                        <p>
                            {formatSlotTime(slot.start_time)} -{" "}
                            {formatSlotTime(slot.end_time)}
                        </p>
                    </div>

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
                        <p>{formatPrice(court.price_per_hour_cents)}</p>
                    </div>
                </div>

                <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                    Your booking is not created yet. Click confirm below to
                    reserve this court.
                </div>

                <form action={createBooking} className="mt-6">
                    <input type="hidden" name="slotId" value={slot.id} />
                    <input type="hidden" name="date" value={date} />

                    <SubmitButton pendingText="Confirming..." className="w-full">
                        Confirm booking
                    </SubmitButton>
                </form>

                <Link
                    href={`/bookings/new?date=${date}`}
                    className="mt-3 block w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                    Choose another slot
                </Link>
            </div>
        </section>
    );
}