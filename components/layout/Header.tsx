import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Courts",
    href: "/courts",
  },
  {
    label: "My Bookings",
    href: "/bookings",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
];

export async function Header() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  const visibleNavLinks = isAdmin
    ? [...navLinks, { label: "Admin", href: "/admin" }]
    : navLinks;

  const logoHref = user ? "/dashboard" : "/";

  return (
    <header className="pointer-events-none absolute left-0 top-0 z-50 w-full px-4 pt-5 sm:px-6 sm:pt-6">
      <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl bg-zinc-950/75 px-5 py-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <Link href={logoHref} className="flex items-center">
          <img
            src="/images/picko-logo.png"
            alt="Picko"
            className="h-9 w-auto object-contain"
          />
        </Link>
  
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-zinc-400">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
  
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-white px-4 py-2 font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-200"
            >
              Log in / Sign up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}