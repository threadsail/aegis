import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CompanySection } from "./CompanySection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .single();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .order("role", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted)]">Company and system settings</p>
      </div>

      <CompanySection settings={settings} />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
          Email system
        </h2>
        <p className="text-sm text-[var(--foreground)]">
          Connect email for direct tickets and email handling.
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Support email</dt>
            <dd className="mt-0.5 text-[var(--foreground)]">
              {settings?.support_email ?? "Not set"}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
          >
            Connect
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
          >
            Configure
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Email integration can be added later (e.g. IMAP/SMTP or inbound provider).
        </p>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
          Team members
        </h2>
        <p className="text-sm text-[var(--foreground)]">
          Manage and invite team members.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--foreground)]">
          {(profiles ?? []).map((p: { id: string; role: string; display_name: string | null }) => (
            <li key={p.id} className="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2">
              <span>{p.display_name || p.id}</span>
              <span className="text-xs text-[var(--muted)]">{p.role}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 rounded-lg bg-[var(--primary-bright)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Invite member
        </button>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Invite sends an email via Supabase Auth or your provider.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
          Subscription
        </h2>
        <p className="text-sm text-[var(--foreground)]">
          Current Aegis subscription and upgrade options.
        </p>
        <div className="mt-3 rounded-lg bg-[var(--background)] p-4 text-sm">
          <p className="font-medium text-[var(--foreground)]">Starter plan</p>
          <p className="mt-1 text-[var(--muted)]">Up to 5 team members, 100 tickets/month</p>
        </div>
        <Link
          href="#"
          className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          View plans / Upgrade
        </Link>
      </section>
    </div>
  );
}
