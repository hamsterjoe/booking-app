import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen overflow-hidden bg-[#dff3ff] px-6 py-10 text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#8cc8e8_0%,#dff3ff_48%,#f8fbff_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,1),rgba(255,255,255,0.82)_34%,transparent_68%)]" />

      <div className="pointer-events-none absolute left-1/2 top-[42%] h-72 w-[52rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col items-center justify-center text-center">
        <div className="pointer-events-none absolute inset-x-0 top-[8%] flex items-center justify-between px-2 sm:px-8">
          <span className="select-none text-[11rem] font-black leading-none tracking-[-0.12em] text-white/70 sm:text-[18rem] lg:text-[24rem]">
            4
          </span>
          <span className="select-none text-[11rem] font-black leading-none tracking-[-0.12em] text-white/70 sm:text-[18rem] lg:text-[24rem]">
            4
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative h-72 w-72 animate-[pickoFloat_4s_ease-in-out_infinite] sm:h-96 sm:w-96">
            <div className="absolute inset-x-10 bottom-8 h-12 rounded-full bg-slate-900/15 blur-2xl" />

            <Image
              src="/images/404-mascot.png"
              alt="Confused Picko mascot"
              fill
              priority
              sizes="(max-width: 640px) 288px, 384px"
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <div className="relative -mt-6 rounded-[2rem] border border-white/70 bg-white/55 px-6 py-6 shadow-2xl shadow-sky-950/10 backdrop-blur-xl sm:px-10">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-sky-700/80">
              404
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Oops, I think we’re lost
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              The page you’re looking for may have moved, disappeared, or never
              made it onto the court.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                ← Back to home
              </Link>

              <Link
                href="/bookings/new"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white/70 px-6 text-sm font-black text-slate-800 shadow-lg shadow-slate-950/5 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Book a court
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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