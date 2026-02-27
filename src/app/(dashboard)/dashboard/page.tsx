import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUSES = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "awaiting", label: "Awaiting" },
  { key: "pending_approval", label: "Pending approval" },
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName =
    (profile?.display_name?.trim()) || user.user_metadata?.full_name || user.email || "there";

  const { data: counts } = await supabase
    .from("tickets")
    .select("status")
    .in("status", STATUSES.map((s) => s.key));

  const countByStatus: Record<string, number> = {};
  STATUSES.forEach((s) => {
    countByStatus[s.key] = 0;
  });
  counts?.forEach((row: { status: string }) => {
    if (row.status in countByStatus) countByStatus[row.status]++;
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Hello{displayName !== "there" ? `, ${displayName}` : " there"}
        </h1>
        {!profile?.display_name && user.email && (
          <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
        )}
      </div>

      <Link
        href="/tickets?status=open"
        className="block rounded-xl border border-[var(--primary)] bg-[var(--primary)] p-8 shadow-sm transition-opacity hover:opacity-90"
      >
        <h2 className="text-sm font-medium uppercase tracking-wider text-white/80">
          Open
        </h2>
        <p className="mt-2 text-4xl font-semibold text-white">
          {countByStatus.open ?? 0}
        </p>
        <p className="mt-1 text-sm text-white/80">tickets</p>
      </Link>

      <div className="grid gap-4 sm:grid-cols-3">
        {STATUSES.filter((s) => s.key !== "open").map(({ key, label }) => (
          <Link
            key={key}
            href={`/tickets?status=${key}`}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-colors hover:border-[var(--primary-bright)] hover:bg-[var(--background)]"
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
              {label}
            </h2>
            <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              {countByStatus[key] ?? 0}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">tickets</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
