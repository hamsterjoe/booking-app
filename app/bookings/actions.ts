"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildBookingRedirectPath(
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

export async function createBooking(formData: FormData) {
    const slotId = String(formData.get("slotId") ?? "");
    const date = String(formData.get("date") ?? "");

    if (!slotId) {
        redirect(
            buildBookingRedirectPath(date, "error", "Missing selected slot."),
        );
    }

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=Please log in to book a court");
    }

    const { error } = await supabase.rpc("create_booking_for_slot", {
        p_slot_id: slotId,
    });

    if (error) {
        redirect(buildBookingRedirectPath(date, "error", error.message));
    }

    revalidatePath("/bookings/new");
    revalidatePath("/bookings");
    revalidatePath("/dashboard");

    redirect(buildBookingsRedirectPath("message", "Your court booking is confirmed."));
}

function buildBookingsRedirectPath(type: "message" | "error", text: string) {
    const params = new URLSearchParams();

    params.set(type, text);

    return `/bookings?${params.toString()}`;
}

function buildBookingDetailRedirectPath(
    bookingId: string,
    type: "message" | "error",
    text: string,
) {
    const params = new URLSearchParams();
    params.set(type, text);
    return `/bookings/${bookingId}?${params.toString()}`;
}

export async function cancelBooking(formData: FormData) {
    const bookingId = String(formData.get("bookingId") ?? "");
    const redirectTarget = String(formData.get("redirectTarget") ?? "list");

    if (!bookingId) {
        redirect(buildBookingsRedirectPath("error", "Missing selected booking."));
    }

    const buildRedirectPath =
        redirectTarget === "detail"
            ? buildBookingDetailRedirectPath
            : (_bookingId: string, type: "message" | "error", text: string) =>
                buildBookingsRedirectPath(type, text);

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=Please log in to cancel a booking");
    }

    const { error } = await supabase.rpc("cancel_booking", {
        p_booking_id: bookingId,
    });

    if (error) {
        redirect(buildRedirectPath(bookingId, "error", error.message));
    }

    revalidatePath("/bookings");
    revalidatePath(`/bookings/${bookingId}`);
    revalidatePath("/dashboard");
    revalidatePath("/bookings/new");

    redirect(
        buildRedirectPath(bookingId, "message", "Your booking has been cancelled."),
    );
}