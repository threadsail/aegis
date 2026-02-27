"use client";

import { updateTicket, type TicketUpdate } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

export type TicketRow = {
  id: string;
  time_entered: string;
  submitted_by: string | null;
  building: string;
  priority: string;
  assigned: string | null;
  status: string;
};

export type ProfileOption = { id: string; display_name: string | null };

const STATUS_OPTIONS = ["open", "in_progress", "awaiting", "pending_approval", "approved"] as const;
const PRIORITY_OPTIONS = ["low", "medium", "high"];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function toDatetimeLocal(iso: string) {
  try {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

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
      return { filled: 4, color: "#9ca3af" };
    default:
      return { filled: 0, color: "transparent" };
  }
}

function statusToLabel(status: string): string {
  const labels: Record<string, string> = {
    open: "Open",
    in_progress: "In progress",
    awaiting: "Awaiting",
    pending_approval: "Pending approval",
    approved: "Approved",
  };
  return labels[status] ?? status.replace(/_/g, " ");
}

function StatusBoxes({ status }: { status: string }) {
  const { filled, color } = statusToIndicator(status);
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Status: ${statusToLabel(status)}`}>
      <span className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-2 w-2 flex-shrink-0 rounded-sm border border-black"
            style={{ backgroundColor: i < filled ? color : "transparent" }}
          />
        ))}
      </span>
      <span className="text-sm text-[var(--foreground)]">{statusToLabel(status)}</span>
    </span>
  );
}

function StatusBoxesOnly({ status }: { status: string }) {
  const { filled, color } = statusToIndicator(status);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Status: ${statusToLabel(status)}`}>
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

export function TicketsTable({
  tickets,
  profiles,
}: {
  tickets: TicketRow[];
  profiles: ProfileOption[];
}) {
  const router = useRouter();
  const profileMap = new Map(profiles.map((p) => [p.id, p.display_name || p.id]));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
    setError(null);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const timeVal = data.get("time_entered") as string;
    const updates: TicketUpdate = {
      building: (data.get("building") as string) || undefined,
      priority: (data.get("priority") as string) || undefined,
      assigned: (data.get("assigned") as string) || null,
      status: (data.get("status") as string) || undefined,
    };
    if (timeVal) {
      updates.time_entered = new Date(timeVal).toISOString();
    }
    const submittedBy = data.get("submitted_by") as string;
    updates.submitted_by = submittedBy || null;

    setSaving(id);
    setError(null);
    const result = await updateTicket(id, updates);
    setSaving(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setExpandedId(null);
    router.refresh();
  }

  if (!tickets?.length) {
    return (
      <div className="px-4 py-12 text-center text-sm text-[var(--muted)] sm:px-6">
        No tickets yet.
      </div>
    );
  }

  return (
    <>
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
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--background)]">
            <th className="w-8 px-2 py-3" aria-label="Expand" />
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Time Entered
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Submitted by
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Building
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Assigned
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {tickets.map((t, i) => {
            const isExpanded = expandedId === t.id;
            const rowBg = i % 2 === 1 ? "bg-[var(--background)]" : "";
            return (
              <Fragment key={t.id}>
                <tr
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={`cursor-pointer ${rowBg} hover:bg-[var(--background)]/70`}
                >
                  <td className="px-2 py-4 text-[var(--muted)]">
                    <span className="inline-block transition-transform" style={{ transform: isExpanded ? "rotate(90deg)" : "none" }}>
                      ▶
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--foreground)]">
                    {formatDate(t.time_entered)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                    {t.submitted_by ? profileMap.get(t.submitted_by) ?? t.submitted_by : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{t.building}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{t.priority}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                    {t.assigned ? profileMap.get(t.assigned) ?? t.assigned : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBoxes status={t.status} />
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${t.id}-expand`} className={rowBg}>
                    <td colSpan={7} className="bg-[var(--background)]/50 p-0">
                      <form
                        onSubmit={(e) => handleSave(e, t.id)}
                        className="border-t border-[var(--border)] px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {error && (
                          <p className="mb-3 text-sm text-red-600">{error}</p>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Time Entered</label>
                            <input
                              type="datetime-local"
                              name="time_entered"
                              defaultValue={toDatetimeLocal(t.time_entered)}
                              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Submitted by</label>
                            <select
                              name="submitted_by"
                              defaultValue={t.submitted_by ?? ""}
                              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                            >
                              <option value="">—</option>
                              {profiles.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.display_name || p.id}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Building</label>
                            <input
                              type="text"
                              name="building"
                              defaultValue={t.building}
                              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Priority</label>
                            <select
                              name="priority"
                              defaultValue={t.priority}
                              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                            >
                              {PRIORITY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Assigned</label>
                            <select
                              name="assigned"
                              defaultValue={t.assigned ?? ""}
                              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                            >
                              <option value="">—</option>
                              {profiles.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.display_name || p.id}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Status</label>
                            <select
                              name="status"
                              defaultValue={t.status}
                              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt.replace("_", " ")}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            type="submit"
                            disabled={!!saving}
                            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                          >
                            {saving === t.id ? "Saving…" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
