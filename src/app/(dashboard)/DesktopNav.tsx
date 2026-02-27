"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tickets", label: "Tickets" },
  { href: "/completed", label: "Completed" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
] as const;

function isActive(href: string, pathname: string) {
  if (pathname === href) return true;
  if (href !== "/dashboard" && href !== "/team" && href !== "/settings" && pathname.startsWith(href + "/")) return true;
  return false;
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex">
      {NAV_LINKS.map(({ href, label }) => {
        const active = isActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-sm font-medium leading-none ${
              active
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground)] hover:bg-[var(--background)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
