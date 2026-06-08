"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildAdminSlotsRedirectPath(type: "message" | "error", text: string) {
    const params = new URLSearchParams();

    params.set(type, text);

    return `/admin/slots?${params.toString()}`;
}

function getCreateCourtSlotErrorMessage(error: {
    code?: string;
    message?: string;
}) {
    if (
        error.code === "23505" ||
        error.message?.includes("unique_court_slots_court_start_end")
    ) {
        return "This court already has a slot at that date and time.";
    }

    return error.message ?? "Could not create court slot.";
}

function isValidDate(value: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
    return /^\d{2}:\d{2}$/.test(value);
}

export async function createCourtSlot(formData: FormData) {
    await requireAdmin();

    const courtId = String(formData.get("courtId") ?? "");
    const date = String(formData.get("date") ?? "");
    const startTime = String(formData.get("startTime") ?? "");
    const durationMinutes = Number(formData.get("durationMinutes") ?? 60);

    if (!courtId) {
        redirect(buildAdminSlotsRedirectPath("error", "Please choose a court."));
    }

    if (!isValidDate(date)) {
        redirect(buildAdminSlotsRedirectPath("error", "Please choose a valid date."));
    }

    if (!isValidTime(startTime)) {
        redirect(buildAdminSlotsRedirectPath("error", "Please choose a valid start time."));
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        redirect(buildAdminSlotsRedirectPath("error", "Please enter a valid duration."));
    }

    const start = new Date(`${date}T${startTime}:00+08:00`);
    const end = new Date(start);

    end.setMinutes(end.getMinutes() + durationMinutes);

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("court_slots").insert({
        court_id: courtId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_available: true,
    });

    if (error) {
        redirect(
            buildAdminSlotsRedirectPath(
                "error",
                getCreateCourtSlotErrorMessage(error)
            )
        );
    }

    revalidatePath("/admin/slots");
    revalidatePath("/bookings/new");

    redirect(buildAdminSlotsRedirectPath("message", "Court slot created."));
}