type PageLoadingProps = {
  label?: string;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-white/10 shadow-inner ${className}`}
    />
  );
}

export function PageLoading({ label = "Loading..." }: PageLoadingProps) {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black px-6 pb-12 pt-24 text-white sm:pt-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-lime-300/15 blur-3xl" />
        <div className="absolute right-[-12%] top-28 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-[-16%] left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="mt-5 h-10 w-full max-w-md rounded-2xl" />
          <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" />
          <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
        </div>

        <div className="grid gap-5 lg:grid-cols-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-4">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime-300/10 blur-3xl" />
            <div className="relative">
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
              <SkeletonBlock className="mt-8 h-8 w-full max-w-sm rounded-2xl" />
              <SkeletonBlock className="mt-4 h-4 w-full max-w-xl" />

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="mt-4 h-8 w-14 rounded-xl" />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="mt-4 h-8 w-20 rounded-xl" />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <SkeletonBlock className="h-3 w-24" />
                  <div className="mt-4 flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <SkeletonBlock key={index} className="h-8 flex-1" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-blue-300/20 bg-slate-950 p-6 shadow-2xl shadow-blue-950/30 lg:col-span-2">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_32%),radial-gradient(circle_at_80%_75%,rgba(14,165,233,0.25),transparent_34%)]" />
            <div className="relative">
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
              <SkeletonBlock className="mt-8 h-10 w-full max-w-48 rounded-2xl" />
              <SkeletonBlock className="mt-4 h-4 w-full" />
              <SkeletonBlock className="mt-3 h-4 w-4/5" />
              <SkeletonBlock className="mt-8 h-11 w-full rounded-full bg-white/20" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-2xl shadow-black/20 lg:col-span-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200" />
              <div className="flex-1">
                <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-3 h-6 w-44 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3">
            <SkeletonBlock className="h-11 w-11 rounded-2xl" />
            <SkeletonBlock className="mt-6 h-3 w-24" />
            <SkeletonBlock className="mt-4 h-7 w-52 rounded-2xl" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-3 h-4 w-4/5" />
          </div>
        </div>

        <p className="text-center text-sm font-medium text-white/50">
          {label}
        </p>
      </div>
    </section>
  );
}