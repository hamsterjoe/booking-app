export function Footer() {
  return (
    <footer className="bg-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Picko. All rights reserved.</p>
        <p>Built with Next.js, Supabase, PostgreSQL, and Vercel.</p>
      </div>
    </footer>
  );
}