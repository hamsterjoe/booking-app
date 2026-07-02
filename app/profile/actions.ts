"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

export async function updatePassword(formData: FormData) {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!newPassword) {
    redirect(
      buildProfileRedirectPath("error", "Please enter a new password."),
    );
  }

  if (newPassword.length < 6) {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Password must be at least 6 characters.",
      ),
    );
  }

  if (newPassword !== confirmPassword) {
    redirect(
      buildProfileRedirectPath("error", "Passwords do not match."),
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please log in to update your password");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    redirect(
      buildProfileRedirectPath(
        "error",
        error.message ?? "Could not update your password.",
      ),
    );
  }

  redirect(buildProfileRedirectPath("message", "Password updated."));
}

export async function deleteAccount(formData: FormData) {
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== "DELETE") {
    redirect(
      buildProfileRedirectPath(
        "error",
        "Please type DELETE to confirm account deletion.",
      ),
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please log in to delete your account");
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: activeBookings, error: activeBookingsError } =
    await supabaseAdmin
      .from("bookings")
      .select("slot_id")
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed"]);

  if (activeBookingsError) {
    redirect(
      buildProfileRedirectPath(
        "error",
        activeBookingsError.message ??
          "Could not prepare your account for deletion.",
      ),
    );
  }

  const slotIds = Array.from(
    new Set(
      (activeBookings ?? [])
        .map((booking) => booking.slot_id)
        .filter(Boolean),
    ),
  );

  if (slotIds.length > 0) {
    const { error: releaseSlotsError } = await supabaseAdmin
      .from("court_slots")
      .update({ is_available: true })
      .in("id", slotIds);

    if (releaseSlotsError) {
      redirect(
        buildProfileRedirectPath(
          "error",
          releaseSlotsError.message ??
            "Could not release your booked slots before account deletion.",
        ),
      );
    }
  }

  const { data: avatarFiles } = await supabaseAdmin.storage
    .from("profile-avatars")
    .list(user.id);

  const avatarPaths =
    avatarFiles?.map((file) => `${user.id}/${file.name}`) ?? [];

  if (avatarPaths.length > 0) {
    await supabaseAdmin.storage.from("profile-avatars").remove(avatarPaths);
  }

  await supabaseAdmin.from("profiles").delete().eq("id", user.id);

  const { error: deleteUserError } =
    await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    redirect(
      buildProfileRedirectPath(
        "error",
        deleteUserError.message ?? "Could not delete your account.",
      ),
    );
  }

  await supabase.auth.signOut();

  redirect("/login?message=Your account has been deleted.");
}