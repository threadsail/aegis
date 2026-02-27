"use client";

import { updateTicket, type TicketUpdate } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = ["open", "in_progress", "awaiting", "pending_approval", "approved"] as const;
const PRIORITY_OPTIONS = ["low", "medium", "high"];

type Ticket = {
  id: string;
  time_entered: string;
  submitted_by: string | null;
  building: string;
  priority: string;
  assigned: string | null;
  status: string;
};

type ProfileOption = { id: string; display_name: string | null };

function toDatetimeLocal(iso: string) {
  try {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export function TicketEditForm({
  ticket,
  profiles,
}: {
  ticket: Ticket;
  profiles: ProfileOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    if (timeVal) updates.time_entered = new Date(timeVal).toISOString();
    updates.submitted_by = (data.get("submitted_by") as string) || null;

    setSaving(true);
    setError(null);
    const result = await updateTicket(ticket.id, updates);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/tickets");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Time Entered</label>
        <input
          type="datetime-local"
          name="time_entered"
          defaultValue={toDatetimeLocal(ticket.time_entered)}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Submitted by</label>
        <select
          name="submitted_by"
          defaultValue={ticket.submitted_by ?? ""}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="">—</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.display_name || p.id}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Building</label>
        <input
          type="text"
          name="building"
          defaultValue={ticket.building}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Priority</label>
        <select
          name="priority"
          defaultValue={ticket.priority}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
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
          defaultValue={ticket.assigned ?? ""}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="">—</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.display_name || p.id}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Status</label>
        <select
          name="status"
          defaultValue={ticket.status}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt.replace("_", " ")}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
