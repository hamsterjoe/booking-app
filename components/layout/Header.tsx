import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginNavLink } from "./LoginNavLink";

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
      <svg className="hidden" aria-hidden="true">
        <filter id="picko-glass-distortion">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.008"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="38" />
        </filter>
      </svg>

      <div className="glass-nav pointer-events-auto mx-auto max-w-6xl">
        <div className="glass-filter" />
        <div className="glass-overlay" />
        <div className="glass-specular" />

        <div className="glass-content flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href={logoHref} className="flex items-center">
            <img
              src="/images/picko-logo.png"
              alt="Picko"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-zinc-300">
            {visibleNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="glass-nav-item">
                {link.label}
              </Link>
            ))}

            {user ? <LogoutButton /> : <LoginNavLink />}
          </nav>
        </div>
      </div>
    </header>
  );
}