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

function buildAdminCourtsRedirectPath(type: "message" | "error", text: string) {
    const params = new URLSearchParams();
  
    params.set(type, text);
  
    return `/admin/courts?${params.toString()}`;
  }
  
  function getCreateCourtErrorMessage(error: {
    code?: string;
    message?: string;
  }) {
    if (
      error.code === "23505" ||
      error.message?.includes("unique_courts_name")
    ) {
      return "A court with this name already exists.";
    }
  
    return error.message ?? "Could not create court.";
  }
  
  export async function createCourt(formData: FormData) {
    await requireAdmin();
  
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const locationLabel = String(formData.get("locationLabel") ?? "").trim();
    const isIndoor = String(formData.get("isIndoor") ?? "true") === "true";
    const pricePerHour = Number(formData.get("pricePerHour") ?? 0);
  
    if (!name) {
      redirect(buildAdminCourtsRedirectPath("error", "Please enter a court name."));
    }
  
    if (!Number.isFinite(pricePerHour) || pricePerHour < 0) {
      redirect(
        buildAdminCourtsRedirectPath("error", "Please enter a valid price."),
      );
    }
  
    const pricePerHourCents = Math.round(pricePerHour * 100);
  
    const supabase = await createSupabaseServerClient();
  
    const { error } = await supabase.from("courts").insert({
      name,
      description: description || null,
      location_label: locationLabel || null,
      is_indoor: isIndoor,
      price_per_hour_cents: pricePerHourCents,
      is_active: true,
    });
  
    if (error) {
      redirect(
        buildAdminCourtsRedirectPath("error", getCreateCourtErrorMessage(error)),
      );
    }
  
    revalidatePath("/admin/courts");
    revalidatePath("/admin");
    revalidatePath("/courts");
    revalidatePath("/bookings/new");
  
    redirect(buildAdminCourtsRedirectPath("message", "Court created."));
  }
  
  export async function toggleCourtActive(formData: FormData) {
    await requireAdmin();
  
    const courtId = String(formData.get("courtId") ?? "");
    const nextIsActive = String(formData.get("nextIsActive") ?? "") === "true";
  
    if (!courtId) {
      redirect(buildAdminCourtsRedirectPath("error", "Missing selected court."));
    }
  
    const supabase = await createSupabaseServerClient();
  
    const { error } = await supabase
      .from("courts")
      .update({
        is_active: nextIsActive,
      })
      .eq("id", courtId);
  
    if (error) {
      redirect(
        buildAdminCourtsRedirectPath(
          "error",
          error.message ?? "Could not update court.",
        ),
      );
    }
  
    revalidatePath("/admin/courts");
    revalidatePath("/admin");
    revalidatePath("/courts");
    revalidatePath("/bookings/new");
  
    redirect(
      buildAdminCourtsRedirectPath(
        "message",
        nextIsActive ? "Court activated." : "Court deactivated.",
      ),
    );
  }