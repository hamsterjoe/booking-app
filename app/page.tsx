import Link from "next/link";
import { RegisterModal } from "@/components/auth/RegisterModal";

type HomePageProps = {
  searchParams: Promise<{
    auth?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const shouldShowSignupModal = params.auth === "signup";

  return (
    <>
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-32 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('/images/picko-hero.jpg')" }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.18),transparent_32rem)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/55 to-black"
        />

        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="mb-5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100 shadow-2xl backdrop-blur-md">
            Picko by TJY
          </p>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Picko Pickleball
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg">
            Book your next pickleball court in seconds from your streamlined booking site preferred by thousands nationwide.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/bookings/new" className="picko-hero-button">
              <span>Book a court now</span>
            </Link>

            <Link
              href="/courts"
              className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
            >
              View courts
            </Link>
          </div>
        </div>
      </section>

      {shouldShowSignupModal ? (
        <RegisterModal error={params.error} message={params.message} />
      ) : null}
    </>
  );
}