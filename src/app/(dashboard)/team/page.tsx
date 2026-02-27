import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .order("role", { ascending: true });

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">
          Unable to load team. Ensure Supabase is configured and migrations are run.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">{error.message}</p>
      </div>
    );
  }

  const managers = (profiles ?? []).filter((p: { role: string }) => p.role === "manager");
  const staff = (profiles ?? []).filter((p: { role: string }) => p.role === "staff");

  function Card({
    id,
    role,
    displayName,
  }: {
    id: string;
    role: string;
    displayName: string | null;
  }) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="font-medium text-[var(--foreground)]">
          {displayName || "No name"}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">{id}</p>
        <span className="mt-2 inline-block rounded bg-[var(--background)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
          {role}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Team</h1>
        <p className="text-sm text-[var(--muted)]">Managers and staff</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
          Managers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {managers.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No managers yet.</p>
          ) : (
            managers.map((p: { id: string; role: string; display_name: string | null }) => (
              <Card
                key={p.id}
                id={p.id}
                role={p.role}
                displayName={p.display_name}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
          Staff
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No staff yet.</p>
          ) : (
            staff.map((p: { id: string; role: string; display_name: string | null }) => (
              <Card
                key={p.id}
                id={p.id}
                role={p.role}
                displayName={p.display_name}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
