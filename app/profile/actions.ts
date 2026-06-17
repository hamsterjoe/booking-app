"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildProfileRedirectPath(type: "message" | "error", text: string) {
  const params = new URLSearchParams();
  params.set(type, text);
  return `/profile?${params.toString()}`;
}

export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "+60").trim();
  const phoneLocalNumber = String(formData.get("phoneLocalNumber") ?? "").trim();

  const cleanedPhoneLocalNumber = phoneLocalNumber.replace(/[\s-]/g, "");

  if (phoneLocalNumber && !/^\d{7,15}$/.test(cleanedPhoneLocalNumber)) {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Please enter a valid phone number with 7 to 15 digits.",
      ),
    );
  }

  const phoneNumber = cleanedPhoneLocalNumber
    ? `${countryCode} ${cleanedPhoneLocalNumber}`
    : "";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please log in to update your profile");
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName || null,
      phone_number: phoneNumber || null,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    redirect(
      buildProfileRedirectPath(
        "error",
        error.message ?? "Could not update your profile.",
      ),
    );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  redirect(buildProfileRedirectPath("message", "Profile updated."));
}