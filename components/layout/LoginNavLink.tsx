"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LoginNavLink() {
  const pathname = usePathname();

  const href = pathname === "/" ? "/?auth=login" : "/login";

  return (
    <Link href={href} className="picko-signup-button">
      Log in
    </Link>
  );
}