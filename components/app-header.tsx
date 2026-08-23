import Image from "next/image";
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
    <header className="relative overflow-hidden bg-gradient-to-br from-brand-dark to-brand-dark2 text-white">
      <div
        aria-hidden
        className="brand-watermark pointer-events-none absolute -right-12 -top-14 h-[230px] w-[230px] rotate-[8deg] opacity-40 [filter:brightness(0)_invert(1)]"
      />
      <div className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white p-1">
              <Image src="/brand/crest.png" alt="SC Braga" width={32} height={32} className="h-full w-full object-contain" />
            </div>
            <span className="font-condensed text-sm font-bold tracking-wide">SC Braga Masters</span>
          </Link>
          <nav className="flex items-center gap-4 font-condensed text-sm font-semibold tracking-wide">
            <Link href="/dashboard" className="text-white/75 hover:text-white">
              Dashboard
            </Link>
            {role === "athlete" && (
              <Link href="/dashboard/provas" className="text-white/75 hover:text-white">
                Provas
              </Link>
            )}
            {role === "coach" && (
              <Link href="/backoffice" className="text-white/75 hover:text-white">
                Backoffice
              </Link>
            )}
            <Link href="/profile" className="text-white/75 hover:text-white">
              Perfil
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 font-condensed text-sm">
          <span className="text-white/85">{fullName}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md border border-white/25 px-3 py-1.5 font-semibold text-white hover:bg-white/10"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
