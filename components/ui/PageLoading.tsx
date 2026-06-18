type PageLoadingProps = {
    label?: string;
  };
  
  export function PageLoading({ label = "Loading..." }: PageLoadingProps) {
    return (
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="mt-4 h-8 w-64 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-full max-w-xl rounded bg-slate-100" />
        </div>
  
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="mt-5 h-8 w-16 rounded bg-slate-100" />
          </div>
  
          <div className="h-32 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="mt-5 h-8 w-16 rounded bg-slate-100" />
          </div>
  
          <div className="h-32 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="mt-5 h-8 w-16 rounded bg-slate-100" />
          </div>
        </div>
  
        <p className="text-sm text-slate-500">{label}</p>
      </section>
    );
  }