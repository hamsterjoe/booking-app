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