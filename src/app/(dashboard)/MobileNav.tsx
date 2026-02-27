"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tickets", label: "Tickets" },
  { href: "/completed", label: "Completed" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
] as const;

export function MobileNav({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--foreground)] hover:bg-[var(--background)] md:hidden"
        aria-label="Open menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <span className="text-xl" aria-hidden>✕</span>
        ) : (
          <span className="text-xl" aria-hidden>☰</span>
        )}
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 z-20 bg-black/20 md:hidden"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 right-0 top-14 z-30 border-b border-[var(--border)] bg-[var(--card)] shadow-lg md:hidden">
            <nav className="flex flex-col py-2">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium ${
                    pathname === href || (href !== "/dashboard" && href !== "/team" && href !== "/settings" && pathname.startsWith(href + "/"))
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="mt-2 border-t border-[var(--border)] px-4 py-3">
                <p className="truncate text-xs text-[var(--muted)]" title={user.email ?? undefined}>
                  {user.email}
                </p>
                <button
                  type="button"
                  onClick={signOut}
                  className="mt-2 w-full rounded-md py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                >
                  Sign out
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
