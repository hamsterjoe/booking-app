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

function GlassSkeletonCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-4rem] left-[-3rem] h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative">{children}</div>
    </div>
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
        <GlassSkeletonCard>
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="mt-5 h-10 w-full max-w-md rounded-2xl" />
          <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" />
          <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
        </GlassSkeletonCard>

        <div className="grid gap-5 lg:grid-cols-3">
          <GlassSkeletonCard className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />

              <div className="flex-1">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="mt-3 h-6 w-full max-w-xs rounded-2xl" />
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="mt-4 h-7 w-32 rounded-xl" />
                <SkeletonBlock className="mt-3 h-3 w-24" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="mt-4 h-7 w-36 rounded-xl" />
                <SkeletonBlock className="mt-3 h-3 w-28" />
              </div>
            </div>
          </GlassSkeletonCard>

          <GlassSkeletonCard>
            <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            <SkeletonBlock className="mt-6 h-3 w-28" />
            <SkeletonBlock className="mt-4 h-7 w-44 rounded-2xl" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-3 h-4 w-4/5" />
          </GlassSkeletonCard>

          <GlassSkeletonCard>
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-5 h-8 w-20 rounded-2xl" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-3 h-4 w-3/4" />
          </GlassSkeletonCard>

          <GlassSkeletonCard>
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="mt-5 h-8 w-32 rounded-2xl" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-3 h-4 w-4/5" />
          </GlassSkeletonCard>

          <GlassSkeletonCard>
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-5 h-8 w-28 rounded-2xl" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-3 h-4 w-2/3" />
          </GlassSkeletonCard>
        </div>

        <p className="text-center text-sm font-medium text-white/50">
          {label}
        </p>
      </div>
    </section>
  );
}