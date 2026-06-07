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

    redirect(
        buildBookingRedirectPath(date, "message", "Your court booking is confirmed."),
    );
}

function buildBookingsRedirectPath(type: "message" | "error", text: string) {
    const params = new URLSearchParams();

    params.set(type, text);

    return `/bookings?${params.toString()}`;
}

export async function cancelBooking(formData: FormData) {
    const bookingId = String(formData.get("bookingId") ?? "");

    if (!bookingId) {
        redirect(buildBookingsRedirectPath("error", "Missing selected booking."));
    }

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
        redirect(buildBookingsRedirectPath("error", error.message));
    }

    revalidatePath("/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/bookings/new");

    redirect(
        buildBookingsRedirectPath("message", "Your booking has been cancelled."),
    );
}