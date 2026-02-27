"use client";

import { returnTicketToPending } from "../tickets/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReturnToPendingButton({
  ticketId,
  redirectTo,
}: {
  ticketId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    const result = await returnTicketToPending(ticketId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)] disabled:opacity-50"
    >
        {loading ? "Returning…" : "Return to pending"}
      </button>
    </span>
  );
}
