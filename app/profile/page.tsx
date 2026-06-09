import Link from "next/link";
import { redirect } from "next/navigation";
import { updateProfile } from "@/app/profile/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfilePageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

type Profile = {
  full_name: string | null;
  phone_number: string | null;
  role: string;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please log in to view your profile");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone_number, role")
    .eq("id", user.id)
    .maybeSingle();

  const currentProfile = profile as Profile | null;

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to dashboard
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Profile settings
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Your profile
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Manage your basic Picko account details.
        </p>
      </div>

      {params.message ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {params.message}
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {params.error}
        </div>
      ) : null}

      {profileError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {profileError.message}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Account details
        </h2>

        <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <p className="font-medium text-slate-900">Email</p>
            <p>{user.email}</p>
          </div>

          <div>
            <p className="font-medium text-slate-900">Role</p>
            <p className="capitalize">{currentProfile?.role ?? "user"}</p>
          </div>
        </div>
      </div>

      <form
        action={updateProfile}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-950">
          Edit profile
        </h2>

        <div className="mt-6 grid gap-4">
          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-slate-700"
            >
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={currentProfile?.full_name ?? ""}
              placeholder="Your name"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-slate-700"
            >
              Phone number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              defaultValue={currentProfile?.phone_number ?? ""}
              placeholder="012-345 6789"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              This can help Picko contact you about your bookings later.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <SubmitButton pendingText="Saving profile..." className="w-full">
            Save profile
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}