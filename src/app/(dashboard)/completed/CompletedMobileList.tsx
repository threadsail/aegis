"use client";

import Link from "next/link";

type Ticket = {
  id: string;
  submitted_by: string | null;
  building: string;
  status: string;
};

type ProfileOption = { id: string; display_name: string | null };

function statusToIndicator(status: string): { filled: number; color: string } {
  switch (status) {
    case "open":
      return { filled: 1, color: "rgb(220 38 38)" };
    case "in_progress":
      return { filled: 2, color: "#eab308" };
    case "awaiting":
      return { filled: 3, color: "#84cc16" };
    case "pending_approval":
      return { filled: 4, color: "#2563eb" };
    case "approved":
      return { filled: 4, color: "var(--primary)" };
    default:
      return { filled: 0, color: "transparent" };
  }
}

function StatusBoxesOnly({ status }: { status: string }) {
  const { filled, color } = statusToIndicator(status);
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-2 w-2 flex-shrink-0 rounded-sm border border-black"
          style={{ backgroundColor: i < filled ? color : "transparent" }}
        />
      ))}
    </span>
  );
}

export function CompletedMobileList({
  tickets,
  profiles,
}: {
  tickets: Ticket[];
  profiles: ProfileOption[];
}) {
  const profileMap = new Map(profiles.map((p) => [p.id, p.display_name || p.id]));

  if (!tickets?.length) {
    return (
      <div className="px-4 py-12 text-center text-sm text-[var(--muted)] md:hidden">
        No completed tickets yet.
      </div>
    );
  }

  return (
    <div className="space-y-2 px-4 pb-4 md:hidden">
      {tickets.map((t, i) => (
        <Link
          key={t.id}
          href={`/tickets/${t.id}`}
          className={`flex min-h-[44px] items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-3 text-left shadow-sm active:opacity-90 ${
            i % 2 === 1 ? "bg-[var(--background)]" : "bg-[var(--card)]"
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">
              {t.submitted_by ? profileMap.get(t.submitted_by) ?? "—" : "—"}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">{t.building}</p>
          </div>
          <StatusBoxesOnly status={t.status} />
        </Link>
      ))}
    </div>
  );
}
