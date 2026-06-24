"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/auth/actions";

type ProfileDropdownProps = {
  name?: string | null;
  email?: string | null;
};

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    if (parts[0]) {
      return parts[0][0].toUpperCase();
    }
  }

  if (email) {
    return email[0].toUpperCase();
  }

  return "P";
}

export function ProfileDropdown({ name, email }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = name || "Profile";
  const displayEmail = email || "Signed in";
  const initials = getInitials(name, email);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="profile-menu-trigger"
      >
        <span className="profile-menu-avatar">{initials}</span>

        <span className="hidden text-left sm:block">
          <span className="block max-w-28 truncate text-sm font-bold text-white">
            {displayName}
          </span>
          <span className="block max-w-32 truncate text-xs text-zinc-400">
            {displayEmail}
          </span>
        </span>

        <span
          className={`text-xs text-zinc-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="profile-menu-panel">
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="profile-menu-avatar profile-menu-avatar-large">
                {initials}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-zinc-400">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link href="/profile" className="profile-menu-item">
              <span>Profile personalisation</span>
            </Link>

            <button type="button" disabled className="profile-menu-item-disabled">
              <span>Coupons</span>
              <span className="profile-menu-badge">Coming soon</span>
            </button>

            <button type="button" disabled className="profile-menu-item-disabled">
              <span>FAQ</span>
              <span className="profile-menu-badge">Coming soon</span>
            </button>

            <button type="button" disabled className="profile-menu-item-disabled">
              <span>Customer service</span>
              <span className="profile-menu-badge">Coming soon</span>
            </button>
          </div>

          <div className="border-t border-white/10 p-2">
            <form action={logout}>
              <button type="submit" className="profile-menu-logout">
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}