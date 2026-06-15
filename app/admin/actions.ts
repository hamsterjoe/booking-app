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

function buildAdminBookingDetailRedirectPath(
  bookingId: string,
  type: "message" | "error",
  text: string,
) {
  const params = new URLSearchParams();
  params.set(type, text);
  return `/admin/bookings/${bookingId}?${params.toString()}`;
}

export async function createBulkCourtSlots(formData: FormData) {
  await requireAdmin();

  const courtId = String(formData.get("courtId") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);

  if (!courtId) {
    redirect(buildAdminSlotsRedirectPath("error", "Please choose a court."));
  }

  if (!isValidDate(startDate)) {
    redirect(buildAdminSlotsRedirectPath("error", "Please choose a valid start date."));
  }

  if (!isValidDate(endDate)) {
    redirect(buildAdminSlotsRedirectPath("error", "Please choose a valid end date."));
  }

  if (!isValidTime(startTime)) {
    redirect(buildAdminSlotsRedirectPath("error", "Please choose a valid start time."));
  }

  if (!isValidTime(endTime)) {
    redirect(buildAdminSlotsRedirectPath("error", "Please choose a valid end time."));
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    redirect(buildAdminSlotsRedirectPath("error", "Please enter a valid duration."));
  }

  const startDateStart = new Date(`${startDate}T00:00:00+08:00`);
  const endDateStart = new Date(`${endDate}T00:00:00+08:00`);

  if (endDateStart < startDateStart) {
    redirect(
      buildAdminSlotsRedirectPath(
        "error",
        "End date must be the same as or after start date.",
      ),
    );
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const dayCount =
    Math.floor((endDateStart.getTime() - startDateStart.getTime()) / oneDayMs) + 1;

  if (dayCount > 14) {
    redirect(
      buildAdminSlotsRedirectPath(
        "error",
        "Please generate slots for 14 days or fewer at a time.",
      ),
    );
  }

  const slotsToInsert: Array<{
    court_id: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }> = [];

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
    const currentDate = new Date(startDateStart);
    currentDate.setUTCDate(currentDate.getUTCDate() + dayIndex);

    const currentDateString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(currentDate);

    const rangeStart = new Date(`${currentDateString}T${startTime}:00+08:00`);
    const rangeEnd = new Date(`${currentDateString}T${endTime}:00+08:00`);

    if (rangeEnd <= rangeStart) {
      redirect(
        buildAdminSlotsRedirectPath(
          "error",
          "End time must be after start time.",
        ),
      );
    }

    let currentStart = new Date(rangeStart);

    while (currentStart < rangeEnd) {
      const currentEnd = new Date(currentStart);
      currentEnd.setMinutes(currentEnd.getMinutes() + durationMinutes);

      if (currentEnd > rangeEnd) {
        break;
      }

      slotsToInsert.push({
        court_id: courtId,
        start_time: currentStart.toISOString(),
        end_time: currentEnd.toISOString(),
        is_available: true,
      });

      currentStart = currentEnd;
    }
  }

  if (slotsToInsert.length === 0) {
    redirect(
      buildAdminSlotsRedirectPath(
        "error",
        "No slots could be created from that date and time range.",
      ),
    );
  }

  if (slotsToInsert.length > 100) {
    redirect(
      buildAdminSlotsRedirectPath(
        "error",
        "Please generate 100 slots or fewer at a time.",
      ),
    );
  }

  const firstGeneratedSlot = slotsToInsert[0];
  const lastGeneratedSlot = slotsToInsert[slotsToInsert.length - 1];

  const supabase = await createSupabaseServerClient();

  const { data: existingSlots, error: existingSlotsError } = await supabase
    .from("court_slots")
    .select("start_time, end_time")
    .eq("court_id", courtId)
    .gte("start_time", firstGeneratedSlot.start_time)
    .lte("start_time", lastGeneratedSlot.start_time);

  if (existingSlotsError) {
    redirect(
      buildAdminSlotsRedirectPath(
        "error",
        existingSlotsError.message ?? "Could not check existing slots.",
      ),
    );
  }

  const existingSlotKeys = new Set(
    (existingSlots ?? []).map((slot) => {
      const startMs = new Date(slot.start_time).getTime();
      const endMs = new Date(slot.end_time).getTime();

      return `${startMs}-${endMs}`;
    }),
  );

  const newSlotsToInsert = slotsToInsert.filter((slot) => {
    const startMs = new Date(slot.start_time).getTime();
    const endMs = new Date(slot.end_time).getTime();

    return !existingSlotKeys.has(`${startMs}-${endMs}`);
  });

  const skippedCount = slotsToInsert.length - newSlotsToInsert.length;

  if (newSlotsToInsert.length === 0) {
    redirect(
      buildAdminSlotsRedirectPath(
        "message",
        "No new slots created. All slots in this date range already exist.",
      ),
    );
  }

  const { error } = await supabase.from("court_slots").insert(newSlotsToInsert);

  if (error) {
    redirect(
      buildAdminSlotsRedirectPath(
        "error",
        getCreateCourtSlotErrorMessage(error),
      ),
    );
  }

  revalidatePath("/admin/slots");
  revalidatePath("/admin");
  revalidatePath("/bookings/new");

  const createdText = `${newSlotsToInsert.length} slot${
    newSlotsToInsert.length === 1 ? "" : "s"
  } created`;

  const skippedText =
    skippedCount > 0
      ? ` ${skippedCount} duplicate slot${skippedCount === 1 ? "" : "s"} skipped.`
      : ".";

  redirect(
    buildAdminSlotsRedirectPath(
      "message",
      `${createdText}.${skippedText}`,
    ),
  );
}

function buildAdminCourtsRedirectPath(type: "message" | "error", text: string) {
  const params = new URLSearchParams();
  params.set(type, text);
  return `/admin/courts?${params.toString()}`;
}

function buildEditCourtRedirectPath(
  courtId: string,
  type: "message" | "error",
  text: string,
) {
  const params = new URLSearchParams();
  params.set(type, text);
  return `/admin/courts/${courtId}/edit?${params.toString()}`;
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

export async function updateCourt(formData: FormData) {
  await requireAdmin();

  const courtId = String(formData.get("courtId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const locationLabel = String(formData.get("locationLabel") ?? "").trim();
  const isIndoor = String(formData.get("isIndoor") ?? "true") === "true";
  const pricePerHour = Number(formData.get("pricePerHour") ?? 0);

  if (!courtId) {
    redirect(buildAdminCourtsRedirectPath("error", "Missing selected court."));
  }

  if (!name) {
    redirect(
      buildEditCourtRedirectPath(courtId, "error", "Please enter a court name."),
    );
  }

  if (!Number.isFinite(pricePerHour) || pricePerHour < 0) {
    redirect(
      buildEditCourtRedirectPath(
        courtId,
        "error",
        "Please enter a valid price.",
      ),
    );
  }

  const pricePerHourCents = Math.round(pricePerHour * 100);

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("courts")
    .update({
      name,
      description: description || null,
      location_label: locationLabel || null,
      is_indoor: isIndoor,
      price_per_hour_cents: pricePerHourCents,
    })
    .eq("id", courtId);

  if (error) {
    redirect(
      buildEditCourtRedirectPath(
        courtId,
        "error",
        getCreateCourtErrorMessage(error),
      ),
    );
  }

  revalidatePath("/admin/courts");
  revalidatePath("/admin");
  revalidatePath("/courts");
  revalidatePath(`/courts/${courtId}`);
  revalidatePath("/bookings/new");

  redirect(buildAdminCourtsRedirectPath("message", "Court updated."));
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

export async function toggleCourtSlotAvailability(formData: FormData) {
  await requireAdmin();

  const slotId = String(formData.get("slotId") ?? "");
  const nextIsAvailable = String(formData.get("nextIsAvailable") ?? "") === "true";

  if (!slotId) {
    redirect(buildAdminSlotsRedirectPath("error", "Missing selected slot."));
  }

  const supabase = await createSupabaseServerClient();

  if (nextIsAvailable) {
    const { data: activeBookings, error: activeBookingsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("slot_id", slotId)
      .in("status", ["pending", "confirmed"])
      .limit(1);

    if (activeBookingsError) {
      redirect(
        buildAdminSlotsRedirectPath("error", activeBookingsError.message),
      );
    }

    if (activeBookings && activeBookings.length > 0) {
      redirect(
        buildAdminSlotsRedirectPath(
          "error",
          "This slot has an active booking and cannot be reactivated manually.",
        ),
      );
    }
  }

  const { error } = await supabase
    .from("court_slots")
    .update({
      is_available: nextIsAvailable,
    })
    .eq("id", slotId);

  if (error) {
    redirect(buildAdminSlotsRedirectPath("error", error.message));
  }

  revalidatePath("/admin/slots");
  revalidatePath("/bookings/new");
  revalidatePath("/admin");

  redirect(
    buildAdminSlotsRedirectPath(
      "message",
      nextIsAvailable ? "Slot reactivated." : "Slot deactivated.",
    ),
  );
}

export async function adminCancelBooking(formData: FormData) {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") ?? "");

  if (!bookingId) {
    redirect("/admin/bookings?error=Missing selected booking.");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.rpc("admin_cancel_booking", {
    p_booking_id: bookingId,
  });

  if (error) {
    redirect(
      buildAdminBookingDetailRedirectPath(
        bookingId,
        "error",
        error.message ?? "Could not cancel booking.",
      ),
    );
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/bookings/new");

  redirect(
    buildAdminBookingDetailRedirectPath(
      bookingId,
      "message",
      "Booking cancelled.",
    ),
  );
}

export async function updateAdminBookingNotes(formData: FormData) {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!bookingId) {
    redirect("/admin/bookings?error=Missing selected booking.");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.rpc("admin_update_booking_notes", {
    p_booking_id: bookingId,
    p_notes: notes,
  });

  if (error) {
    redirect(
      buildAdminBookingDetailRedirectPath(
        bookingId,
        "error",
        error.message ?? "Could not update booking notes.",
      ),
    );
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);

  redirect(
    buildAdminBookingDetailRedirectPath(
      bookingId,
      "message",
      "Booking notes updated.",
    ),
  );
}