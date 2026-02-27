"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TicketUpdate = {
  time_entered?: string;
  submitted_by?: string | null;
  building?: string;
  priority?: string;
  assigned?: string | null;
  status?: string;
};

export async function updateTicket(id: string, updates: TicketUpdate) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.time_entered !== undefined) payload.time_entered = updates.time_entered;
  if (updates.submitted_by !== undefined) payload.submitted_by = updates.submitted_by;
  if (updates.building !== undefined && updates.building.trim()) payload.building = updates.building.trim();
  if (updates.priority !== undefined && updates.priority.trim()) payload.priority = updates.priority.trim();
  if (updates.assigned !== undefined) payload.assigned = updates.assigned;
  if (updates.status !== undefined && updates.status.trim()) payload.status = updates.status.trim();

  const { error } = await supabase.from("tickets").update(payload).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/tickets");
  revalidatePath("/completed");
  return {};
}

export async function returnTicketToPending(id: string) {
  return updateTicket(id, { status: "pending_approval" });
}
