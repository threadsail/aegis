import { ReturnToPendingButton } from "./ReturnToPendingButton";
import { CompletedMobileList } from "./CompletedMobileList";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CompletedPage() {
  const supabase = await createClient();
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("status", "approved")
    .order("time_entered", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">
          Unable to load completed tickets. Ensure Supabase is configured and migrations are run.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">{error.message}</p>
      </div>
    );
  }

  const userIds = new Set<string>();
  tickets?.forEach((t: { submitted_by?: string; assigned?: string }) => {
    if (t.submitted_by) userIds.add(t.submitted_by);
    if (t.assigned) userIds.add(t.assigned);
  });
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", Array.from(userIds));
  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name ?? p.id])
  );

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

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Completed</h1>
        <p className="text-sm text-[var(--muted)]">Archived tickets approved by a manager</p>
      </div>
      <CompletedMobileList tickets={tickets ?? []} profiles={profiles ?? []} />
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
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
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {(!tickets || tickets.length === 0) ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--muted)]">
                  No completed tickets yet.
                </td>
              </tr>
            ) : (
              tickets.map((t: {
                id: string;
                time_entered: string;
                submitted_by: string | null;
                building: string;
                priority: string;
                assigned: string | null;
                status: string;
              }, i: number) => (
                <tr
                  key={t.id}
                  className={`${i % 2 === 1 ? "bg-[var(--background)]" : ""} hover:bg-[var(--background)]/70`}
                >
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
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center gap-0.5">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className="h-2 w-2 flex-shrink-0 rounded-sm border border-black bg-[var(--primary)]"
                          />
                        ))}
                      </span>
                      <span className="font-medium text-[var(--foreground)]">
                        {t.status.replace("_", " ")}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ReturnToPendingButton ticketId={t.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
