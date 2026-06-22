"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const errorRedirectTo = String(formData.get("errorRedirectTo") ?? "/register");

  const safeErrorRedirectTo =
    errorRedirectTo === "/?auth=signup" ? "/?auth=signup" : "/register";

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Registration error:", error.message);

    const separator = safeErrorRedirectTo.includes("?") ? "&" : "?";

    redirect(
      `${safeErrorRedirectTo}${separator}error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect("/login?message=Check your email to confirm your account");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=Invalid email or password");
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}