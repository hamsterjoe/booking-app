import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-black via-red-950 to-black px-6 pb-14 pt-28 text-white sm:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-8 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/30 blur-3xl" />
        <div className="absolute left-[-8rem] top-1/3 h-96 w-96 rounded-full bg-red-800/30 blur-3xl" />
        <div className="absolute right-[-8rem] bottom-10 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-red-950/60 blur-3xl" />
      </div>

      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_50%_48%,rgba(248,113,113,0.12),transparent_38%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-7xl flex-col items-center justify-center text-center">
        <div className="pointer-events-none absolute left-1/2 top-[-1rem] z-0 flex w-full max-w-7xl -translate-x-1/2 select-none items-center justify-between px-2 sm:top-[-2rem] sm:px-8 lg:px-12">
          <span className="glow-404 text-[9rem] font-black leading-none tracking-[-0.12em] sm:text-[17rem] lg:text-[24rem]">
            4
          </span>

          <span className="glow-404 text-[9rem] font-black leading-none tracking-[-0.12em] sm:text-[17rem] lg:text-[24rem]">
            0
          </span>

          <span className="glow-404 text-[9rem] font-black leading-none tracking-[-0.12em] sm:text-[17rem] lg:text-[24rem]">
            4
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative z-20 h-72 w-72 animate-[pickoFloat_4s_ease-in-out_infinite] sm:h-96 sm:w-96">
            <div className="absolute inset-x-10 bottom-8 h-12 rounded-full bg-black/60 blur-2xl" />

            <Image
              src="/images/404-mascot.png"
              alt="Confused Picko mascot"
              fill
              priority
              sizes="(max-width: 640px) 288px, 384px"
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <div className="relative z-100 -mt-6 w-full max-w-3xl rounded-[2rem] border border-white/15 bg-white/[0.08] px-6 py-7 shadow-2xl shadow-red-950/30 backdrop-blur-2xl sm:px-12 sm:py-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-400/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-3rem] left-[-3rem] h-36 w-36 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-red-200">
                404 error
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
                Oops, I think we’re lost
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                The page you’re looking for may have moved, disappeared, or
                never made it onto the court.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-black text-slate-950 shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-100"
                >
                  ← Back to home
                </Link>

                <Link
                  href="/bookings/new"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Book a court
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.55'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }

        .glow-404 {
          color: rgba(255, 245, 245, 0.72);
          text-shadow:
            0 0 8px rgba(255, 255, 255, 0.7),
            0 0 18px rgba(248, 113, 113, 0.95),
            0 0 42px rgba(239, 68, 68, 0.82),
            0 0 86px rgba(185, 28, 28, 0.72),
            0 0 128px rgba(127, 29, 29, 0.55);
          filter: blur(0.35px);
        }

        @keyframes pickoFloat {
          0%, 100% {
            transform: translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateY(-14px) rotate(1deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\\[pickoFloat_4s_ease-in-out_infinite\\] {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}