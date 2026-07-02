import Link from "next/link";
import { redirect } from "next/navigation";
import { updateProfile } from "@/app/profile/actions";
import { ProfileAvatarInput } from "@/components/profile/ProfileAvatarInput";
import { ProfileDatePicker } from "@/components/profile/ProfileDatePicker";
import { ProfileSelect } from "@/components/profile/ProfileSelect";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfilePageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
    returnTo?: string;
  }>;
};

type Profile = {
  full_name: string | null;
  phone_number: string | null;
  role: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  dupr_rating: number | null;
};

const countryCodeOptions = [
  { label: "Malaysia (+60)", value: "+60" },
  { label: "Singapore (+65)", value: "+65" },
  { label: "Indonesia (+62)", value: "+62" },
  { label: "Thailand (+66)", value: "+66" },
  { label: "United States (+1)", value: "+1" },
  { label: "United Kingdom (+44)", value: "+44" },
];

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Non-binary", value: "non_binary" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

const duprOptions = Array.from({ length: 10 }).map((_, index) => {
  const rating = (index + 2) / 2;

  return {
    label: `DUPR ${rating.toFixed(1)}`,
    value: rating.toFixed(1),
    description:
      rating <= 2
        ? "Beginner / developing player"
        : rating <= 3.5
          ? "Intermediate player"
          : rating <= 4.5
            ? "Advanced player"
            : "Competitive player",
  };
});

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

  const safeReturnTo = params.returnTo?.startsWith("/bookings/confirm")
    ? params.returnTo
    : "";

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
    .select(
      "full_name, phone_number, role, avatar_url, date_of_birth, gender, dupr_rating",
    )
    .eq("id", user.id)
    .maybeSingle();

  const currentProfile = profile as Profile | null;
  const phoneParts = getPhoneParts(currentProfile?.phone_number);
  const displayName =
    currentProfile?.full_name?.trim() || user.email?.split("@")[0] || "Player";
  const isAdmin = currentProfile?.role === "admin";

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black px-6 pb-14 pt-24 text-white sm:pt-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-16 h-72 w-72 rounded-full bg-lime-300/15 blur-3xl" />
        <div className="absolute right-[-12%] top-32 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-[-16%] left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-bold text-lime-200 transition hover:text-lime-100"
            >
              ← Back to dashboard
            </Link>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.35em] text-lime-300/80">
              Profile personalisation
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Your player profile
            </h1>
          </div>

          {isAdmin ? (
            <span className="inline-flex w-fit rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-sm font-black text-lime-200">
              Admin account
            </span>
          ) : null}
        </div>

        {params.message ? (
          <div className="rounded-3xl border border-lime-300/20 bg-lime-300/10 p-4 text-sm font-semibold text-lime-100 backdrop-blur-xl">
            {params.message}
          </div>
        ) : null}

        {params.error ? (
          <div className="rounded-3xl border border-red-300/20 bg-red-400/10 p-4 text-sm font-semibold text-red-100 backdrop-blur-xl">
            {params.error}
          </div>
        ) : null}

        {profileError ? (
          <div className="rounded-3xl border border-red-300/20 bg-red-400/10 p-4 text-sm font-semibold text-red-100 backdrop-blur-xl">
            {profileError.message}
          </div>
        ) : null}

        <form
          action={updateProfile}
          encType="multipart/form-data"
          className="relative overflow-visible rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8"
        >
          <input type="hidden" name="returnTo" value={safeReturnTo} />

          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime-300/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-4rem] left-[-3rem] h-44 w-44 rounded-full bg-blue-300/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6">
              <ProfileAvatarInput
                name="avatar"
                avatarUrl={currentProfile?.avatar_url}
                displayName={displayName}
                email={user.email}
              />

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 text-left">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                  Email
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-white">
                  {user.email}
                </p>
              </div>

              {isAdmin ? (
                <div className="mt-3 rounded-3xl border border-lime-300/20 bg-lime-300/10 p-4 text-left">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-200/70">
                    Role
                  </p>
                  <p className="mt-2 text-sm font-black text-lime-100">
                    Admin
                  </p>
                </div>
              ) : null}
            </aside>

            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Personal details
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/50">
                  Name, phone, and email are required. The rest helps Picko to personalise your playing profile.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="text-sm font-bold text-white/75"
                  >
                    Full name <span className="text-lime-200">*</span>
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    defaultValue={currentProfile?.full_name ?? ""}
                    placeholder="Your name"
                    className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:bg-white/15 focus:border-lime-300/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-white/75">
                    Phone number <span className="text-lime-200">*</span>
                  </label>

                  <div className="mt-2 grid gap-3 sm:grid-cols-[190px_1fr]">
                    <select
                      id="countryCode"
                      name="countryCode"
                      defaultValue={phoneParts.countryCode}
                      className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none transition hover:bg-white/15 focus:border-lime-300/50"
                    >
                      {countryCodeOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-slate-950"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <input
                      id="phoneLocalNumber"
                      name="phoneLocalNumber"
                      type="tel"
                      required
                      defaultValue={phoneParts.localNumber}
                      placeholder="123456789"
                      inputMode="numeric"
                      pattern="[0-9\s-]{7,15}"
                      className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:bg-white/15 focus:border-lime-300/50"
                    />
                  </div>

                  <p className="mt-2 text-xs text-white/40">
                    Enter 7 to 15 digits. Picko saves this with your selected
                    country code.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-white/75">
                    Date of birth
                  </label>

                  <div className="mt-2">
                    <ProfileDatePicker
                      name="dateOfBirth"
                      defaultValue={currentProfile?.date_of_birth}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-white/75">
                    Gender
                  </label>

                  <div className="mt-2">
                    <ProfileSelect
                      name="gender"
                      defaultValue={currentProfile?.gender}
                      placeholder="Select gender"
                      options={genderOptions}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-white/75">
                    DUPR player rating
                  </label>

                  <div className="mt-2">
                    <ProfileSelect
                      name="duprRating"
                      defaultValue={
                        currentProfile?.dupr_rating
                          ? currentProfile.dupr_rating.toFixed(1)
                          : ""
                      }
                      placeholder="Select DUPR rating"
                      options={duprOptions}
                    />
                  </div>

                  <p className="mt-2 text-xs text-white/40">
                    DUPR self rating from 1.0 to 5.5. You can update this anytime.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-white/40">
                  Your email is managed by your login account and cannot be edited here.
                </p>

                <SubmitButton
                  pendingText="Saving profile..."
                  className="min-h-11 rounded-full bg-white px-7 text-slate-950 hover:bg-lime-200 disabled:bg-white/40"
                >
                  Save profile
                </SubmitButton>
              </div>
            </div>
          </div>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/40">
            Account security
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <h3 className="text-lg font-black text-white">
                Change password
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Update your login password securely.
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-lime-200/70">
                Coming in next mini milestone
              </p>
            </div>

            <div className="rounded-3xl border border-red-300/20 bg-red-400/10 p-5">
              <h3 className="text-lg font-black text-red-100">
                Delete account
              </h3>
              <p className="mt-2 text-sm leading-6 text-red-100/60">
                Permanently delete your Picko account after confirmation.
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-red-200/70">
                Coming in next mini milestone
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}