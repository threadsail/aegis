"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function DashboardHeader({ user }: { user: User }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="max-w-[160px] truncate text-sm text-[var(--muted)]" title={user.email ?? undefined}>
        {user.email}
      </span>
      <button
        type="button"
        onClick={signOut}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
      >
        Sign out
      </button>
    </div>
  );
}
