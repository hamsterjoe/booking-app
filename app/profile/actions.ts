"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;

function buildProfileRedirectPath(
  type: "message" | "error",
  text: string,
  returnTo?: string,
) {
  const params = new URLSearchParams();
  params.set(type, text);

  if (returnTo) {
    params.set("returnTo", returnTo);
  }

  return `/profile?${params.toString()}`;
}

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
}

export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "+60").trim();
  const phoneLocalNumber = String(
    formData.get("phoneLocalNumber") ?? "",
  ).trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const duprRatingValue = String(formData.get("duprRating") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "");

  const safeReturnTo = returnTo.startsWith("/bookings/confirm") ? returnTo : "";
  const cleanedPhoneLocalNumber = phoneLocalNumber.replace(/[\s-]/g, "");

  if (!fullName) {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Full name is required.",
        safeReturnTo,
      ),
    );
  }

  if (!cleanedPhoneLocalNumber) {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Phone number is required.",
        safeReturnTo,
      ),
    );
  }

  if (!/^\d{7,15}$/.test(cleanedPhoneLocalNumber)) {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Please enter a valid phone number with 7 to 15 digits.",
        safeReturnTo,
      ),
    );
  }

  if (dateOfBirth && !isValidDateKey(dateOfBirth)) {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Please choose a valid date of birth.",
        safeReturnTo,
      ),
    );
  }

  const allowedGenderValues = [
    "",
    "male",
    "female",
    "non_binary",
    "prefer_not_to_say",
  ];

  if (!allowedGenderValues.includes(gender)) {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Please choose a valid gender option.",
        safeReturnTo,
      ),
    );
  }

  const duprRating = duprRatingValue ? Number(duprRatingValue) : null;

  if (
    duprRating !== null &&
    (!Number.isFinite(duprRating) ||
      duprRating < 1 ||
      duprRating > 5.5 ||
      (duprRating * 10) % 5 !== 0)
  ) {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Please choose a valid DUPR rating between 1.0 and 5.5.",
        safeReturnTo,
      ),
    );
  }

  const phoneNumber = `${countryCode} ${cleanedPhoneLocalNumber}`;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please log in to update your profile");
  }

  let avatarUrl: string | null | undefined;
  const avatarFile = formData.get("avatar");

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      redirect(
        buildProfileRedirectPath(
          "error",
          "Please upload a valid image file.",
          safeReturnTo,
        ),
      );
    }

    if (avatarFile.size > MAX_AVATAR_SIZE) {
      redirect(
        buildProfileRedirectPath(
          "error",
          "Profile picture must be smaller than 3MB.",
          safeReturnTo,
        ),
      );
    }

    const avatarPath = `${user.id}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from("profile-avatars")
      .upload(avatarPath, avatarFile, {
        cacheControl: "3600",
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) {
      redirect(
        buildProfileRedirectPath(
          "error",
          uploadError.message ?? "Could not upload your profile picture.",
          safeReturnTo,
        ),
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-avatars").getPublicUrl(avatarPath);

    avatarUrl = `${publicUrl}?v=${Date.now()}`;
  }

  const profileUpdates = {
    id: user.id,
    full_name: fullName,
    phone_number: phoneNumber,
    date_of_birth: dateOfBirth || null,
    gender: gender || null,
    dupr_rating: duprRating,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  };

  const { error } = await supabase.from("profiles").upsert(profileUpdates, {
    onConflict: "id",
  });

  if (error) {
    redirect(
      buildProfileRedirectPath(
        "error",
        error.message ?? "Could not update your profile.",
        safeReturnTo,
      ),
    );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/bookings/confirm");

  if (safeReturnTo) {
    redirect(safeReturnTo);
  }

  redirect(buildProfileRedirectPath("message", "Profile updated."));
}