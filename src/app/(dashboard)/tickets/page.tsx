import { FilterDropdown } from "./FilterDropdown";
import { TicketsTable } from "./TicketsTable";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["open", "in_progress", "awaiting", "pending_approval"] as const;

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; building?: string }>;
}) {
  const params = await searchParams;
  const statusFilter =
    params.status && VALID_STATUSES.includes(params.status as (typeof VALID_STATUSES)[number])
      ? params.status
      : null;
  const buildingFilter = params.building?.trim() || null;

  const supabase = await createClient();

  const { data: buildingRows } = await supabase
    .from("tickets")
    .select("building")
    .in("status", [...VALID_STATUSES]);
  const buildings = Array.from(
    new Set((buildingRows ?? []).map((r: { building: string }) => r.building).filter(Boolean))
  ).sort();
  const showBuildingFilter = buildings.length > 1;

  let query = supabase
    .from("tickets")
    .select("*")
    .in("status", [...VALID_STATUSES])
    .order("time_entered", { ascending: false });
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  if (buildingFilter) {
    query = query.eq("building", buildingFilter);
  }
  const { data: tickets, error } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">
          Unable to load tickets. Ensure Supabase is configured and migrations are run.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">{error.message}</p>
      </div>
    );
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .order("display_name", { ascending: true, nullsFirst: false });

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Tickets</h1>
        <p className="text-sm text-[var(--muted)]">Active support tickets. Tap a row to expand and edit.</p>
        <div className="mt-4">
          <FilterDropdown
            statusFilter={statusFilter}
            buildingFilter={buildingFilter}
            buildings={buildings}
            showBuildingFilter={showBuildingFilter}
          />
        </div>
      </div>
      <TicketsTable tickets={tickets ?? []} profiles={profiles ?? []} />
    </div>
  );
}
