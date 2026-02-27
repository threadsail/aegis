import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TicketEditForm } from "./TicketEditForm";
import { ReturnToPendingButton } from "../../completed/ReturnToPendingButton";

export const dynamic = "force-dynamic";

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

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) notFound();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .order("display_name", { ascending: true, nullsFirst: false });

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; display_name: string | null }) => [
      p.id,
      p.display_name ?? p.id,
    ])
  );

  return (
    <div className="mx-auto max-w-lg space-y-6 px-0">
      <Link
        href="/tickets"
        className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-[var(--primary-bright)] hover:underline"
      >
        ← Back to tickets
      </Link>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-6">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Ticket</h1>
        <dl className="mt-3 space-y-2 text-sm md:hidden">
          <div>
            <dt className="text-[var(--muted)]">Submitted by</dt>
            <dd className="font-medium">
              {ticket.submitted_by
                ? profileMap.get(ticket.submitted_by) ?? "—"
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Building</dt>
            <dd className="font-medium">{ticket.building}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Time entered</dt>
            <dd className="font-medium">{formatDate(ticket.time_entered)}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Priority</dt>
            <dd className="font-medium">{ticket.priority}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Assigned</dt>
            <dd className="font-medium">
              {ticket.assigned ? profileMap.get(ticket.assigned) ?? "—" : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Status</dt>
            <dd className="font-medium">{ticket.status.replace("_", " ")}</dd>
          </div>
        </dl>
        {ticket.status === "approved" && (
          <div className="mt-4 md:hidden">
            <ReturnToPendingButton ticketId={ticket.id} redirectTo="/tickets" />
          </div>
        )}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-[var(--muted)]">Edit</h2>
          <TicketEditForm ticket={ticket} profiles={profiles ?? []} />
        </div>
      </div>
    </div>
  );
}
