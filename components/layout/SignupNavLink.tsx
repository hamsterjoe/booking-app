"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SignupNavLink() {
  const pathname = usePathname();

  const href = pathname === "/" ? "/?auth=signup" : "/register";

  return (
    <Link href={href} className="picko-signup-button">
      Sign up
    </Link>
  );
}