"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "awaiting", label: "Awaiting" },
  { value: "pending_approval", label: "Pending approval" },
] as const;

function buildUrl(status: string | null, building: string | null) {
  const search = new URLSearchParams();
  if (status) search.set("status", status);
  if (building) search.set("building", building);
  const q = search.toString();
  return q ? `/tickets?${q}` : "/tickets";
}

export function FilterDropdown({
  statusFilter,
  buildingFilter,
  buildings,
  showBuildingFilter,
}: {
  statusFilter: string | null;
  buildingFilter: string | null;
  buildings: string[];
  showBuildingFilter: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);

  const hasFilter = statusFilter !== null || buildingFilter !== null;

  return (
    <div className="relative inline-flex items-center gap-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
      >
        Filter
        <span className="text-[var(--muted)]" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>
      {hasFilter && (
        <Link
          href="/tickets"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
        >
          All
        </Link>
      )}
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[12rem] rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 shadow-lg">
            <div className="px-3 py-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Status
              </p>
              <div className="mt-1.5 flex flex-col gap-0.5">
                {STATUS_FILTERS.map(({ value, label }) => {
                  const isActive =
                    (value === "" && !statusFilter) || value === statusFilter;
                  return (
                    <Link
                      key={value || "all"}
                      href={buildUrl(value || null, buildingFilter)}
                      onClick={() => setOpen(false)}
                      className={`rounded px-2 py-1.5 text-left text-sm ${
                        isActive
                          ? "bg-[var(--primary)] text-white"
                          : "text-[var(--foreground)] hover:bg-[var(--background)]"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
            {showBuildingFilter && (
              <div className="border-t border-[var(--border)] px-3 py-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Building
                </p>
                <div className="mt-1.5 flex flex-col gap-0.5">
                  <Link
                    href={buildUrl(statusFilter, null)}
                    onClick={() => setOpen(false)}
                    className={`rounded px-2 py-1.5 text-left text-sm ${
                      !buildingFilter
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--foreground)] hover:bg-[var(--background)]"
                    }`}
                  >
                    All
                  </Link>
                  {buildings.map((b) => {
                    const isActive = buildingFilter === b;
                    return (
                      <Link
                        key={b}
                        href={buildUrl(statusFilter, b)}
                        onClick={() => setOpen(false)}
                        className={`rounded px-2 py-1.5 text-left text-sm ${
                          isActive
                            ? "bg-[var(--primary)] text-white"
                            : "text-[var(--foreground)] hover:bg-[var(--background)]"
                        }`}
                      >
                        {b}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
