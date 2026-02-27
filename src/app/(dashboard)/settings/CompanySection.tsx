"use client";

import { updateCompanySettings } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CompanySettings = {
  id: string;
  name: string | null;
  address: string | null;
} | null;

export function CompanySection({ settings }: { settings: CompanySettings }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setError(null);
    setSaving(true);
    const form = e.currentTarget;
    const result = await updateCompanySettings(settings.id, {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      address: (form.elements.namedItem("address") as HTMLTextAreaElement).value,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!settings) {
    return (
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
          Company / Corporation
        </h2>
        <p className="text-sm text-[var(--muted)]">No company settings found.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
          Company / Corporation
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label htmlFor="company-name" className="mb-1 block text-sm font-medium text-[var(--muted)]">
              Name
            </label>
            <input
              id="company-name"
              name="name"
              type="text"
              defaultValue={settings.name ?? ""}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>
          <div>
            <label htmlFor="company-address" className="mb-1 block text-sm font-medium text-[var(--muted)]">
              Address
            </label>
            <textarea
              id="company-address"
              name="address"
              rows={3}
              defaultValue={settings.address ?? ""}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null); }}
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Name</dt>
            <dd className="mt-0.5 font-medium text-[var(--foreground)]">
              {settings.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Address</dt>
            <dd className="mt-0.5 text-[var(--foreground)]">
              {settings.address ?? "—"}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
