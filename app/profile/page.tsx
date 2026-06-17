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

const countryCodeOptions = [
  { label: "Malaysia (+60)", value: "+60" },
  { label: "Singapore (+65)", value: "+65" },
  { label: "Indonesia (+62)", value: "+62" },
  { label: "Thailand (+66)", value: "+66" },
  { label: "United States (+1)", value: "+1" },
  { label: "United Kingdom (+44)", value: "+44" },
];

function getPhoneParts(phoneNumber: string | null | undefined) {
  if (!phoneNumber) {
    return {
      countryCode: "+60",
      localNumber: "",
    };
  }

  const matchingCountryCode = countryCodeOptions.find((option) =>
    phoneNumber.startsWith(option.value),
  );

  if (!matchingCountryCode) {
    return {
      countryCode: "+60",
      localNumber: phoneNumber,
    };
  }

  return {
    countryCode: matchingCountryCode.value,
    localNumber: phoneNumber
      .slice(matchingCountryCode.value.length)
      .trim()
      .replace(/[\s-]/g, ""),
  };
}

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
  const phoneParts = getPhoneParts(currentProfile?.phone_number);

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
              htmlFor="phoneLocalNumber"
              className="text-sm font-medium text-slate-700"
            >
              Phone number
            </label>

            <div className="mt-2 grid gap-3 sm:grid-cols-[180px_1fr]">
              <select
                id="countryCode"
                name="countryCode"
                defaultValue={phoneParts.countryCode}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {countryCodeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                id="phoneLocalNumber"
                name="phoneLocalNumber"
                type="tel"
                defaultValue={phoneParts.localNumber}
                placeholder="123456789"
                inputMode="numeric"
                pattern="[0-9\s-]{7,15}"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Enter 7 to 15 digits. Picko will save this with the selected country code.
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