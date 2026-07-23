import Link from "next/link";
import type { UserRole } from "@/lib/supabase/database.types";

export function AppHeader({
  fullName,
  role,
}: {
  fullName: string;
  role: UserRole;
}) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/dashboard" className="text-neutral-900">
            Dashboard
          </Link>
          {role === "coach" && (
            <Link href="/backoffice" className="text-neutral-500 hover:text-neutral-900">
              Backoffice
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span>{fullName}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
