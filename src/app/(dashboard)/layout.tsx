import { ShieldLogo } from "@/components/ShieldLogo";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "./DashboardHeader";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]">
        <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex min-h-[44px] min-w-[44px] items-center gap-2 text-[var(--primary)] hover:opacity-90"
          >
            <ShieldLogo size={28} className="text-[var(--primary)]" />
            <span className="font-semibold">Aegis</span>
          </Link>
          <DesktopNav />
          <div className="flex items-center gap-2">
            <MobileNav user={user} />
            <div className="hidden md:block">
              <DashboardHeader user={user} />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      <footer className="bg-[var(--primary)] py-2.5 text-center text-xs text-white/90 sm:py-3 sm:text-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-x-4 sm:gap-y-0">
          <Link href="/support" className="min-h-[36px] sm:min-h-[44px] inline-flex items-center justify-center px-3 py-1.5 hover:text-white underline underline-offset-2 active:opacity-80">
            Support
          </Link>
          <span className="order-first sm:order-none inline-flex items-center min-h-[28px] sm:min-h-[44px] py-1">© 2026 threadsail.io</span>
          <Link href="/suggestions" className="min-h-[36px] sm:min-h-[44px] inline-flex items-center justify-center px-3 py-1.5 hover:text-white underline underline-offset-2 active:opacity-80">
            Suggestions
          </Link>
        </div>
      </footer>
    </div>
  );
}
