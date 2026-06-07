import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicNavLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Book",
    href: "/bookings/new",
  },
  {
    label: "Courts",
    href: "/courts",
  },
];

const authNavLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Book",
    href: "/bookings/new",
  },
  {
    label: "My bookings",
    href: "/bookings",
  },
  {
    label: "Courts",
    href: "/courts",
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

  const navLinks = user ? authNavLinks : publicNavLinks;
  const logoHref = user ? "/dashboard" : "/";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={logoHref} className="text-xl font-bold text-slate-900">
          Picko
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-slate-950">
              {link.label}
            </Link>
          ))}

          {user ? (
            <LogoutButton />
          ) : (
            <>
              <Link href="/login" className="hover:text-slate-950">
                Login
              </Link>

              <Link href="/register" className="hover:text-slate-950">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}