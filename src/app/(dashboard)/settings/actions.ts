"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCompanySettings(
  id: string,
  updates: { name?: string | null; address?: string | null }
) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name?.trim() || null;
  if (updates.address !== undefined) payload.address = updates.address?.trim() || null;

  const { error } = await supabase.from("company_settings").update(payload).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return {};
}
