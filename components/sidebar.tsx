"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  // um item fica "ativo" também quando a rota atual é uma sub-página dele
  matchPrefix?: boolean;
};

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
} as const;

const NAV_ITEMS: NavItem[] = [
  {
    href: "/backoffice",
    label: "Atletas",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
        <circle cx="18" cy="8" r="2.7" />
        <path d="M15.5 14.2c2.9.3 5 2.6 5 5.8" />
      </svg>
    ),
  },
  {
    href: "/backoffice/competitions",
    label: "Competições",
    matchPrefix: true,
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 9h18" />
      </svg>
    ),
  },
  {
    href: "/backoffice/treino",
    label: "Treino do dia",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    ),
  },
  {
    href: "/backoffice/plantel",
    label: "Plantel",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="4" width="16" height="16" rx="2.5" />
        <circle cx="9.5" cy="10" r="2" />
        <path d="M6.5 16c.5-1.8 1.8-2.7 3-2.7s2.5.9 3 2.7M14 9h4M14 12.5h4" />
      </svg>
    ),
  },
  {
    href: "/backoffice/cem",
    label: "CEM",
    matchPrefix: true,
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M8 21h8M12 17v4M6 3h12l-1 6a5 5 0 01-10 0L6 3zM6 3H3v2a3 3 0 003 3M18 3h3v2a3 3 0 01-3 3" />
      </svg>
    ),
  },
];

export function Sidebar({ fullName }: { fullName: string }) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    if (item.matchPrefix) return pathname.startsWith(item.href);
    return pathname === item.href;
  }

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "SC";

  return (
    <aside className="relative flex w-[230px] shrink-0 flex-col overflow-hidden bg-brand-dark px-4 py-[22px] text-white">
      <div
        aria-hidden
        className="brand-watermark pointer-events-none absolute -bottom-10 -left-[70px] h-[260px] w-[260px] rotate-[-6deg] opacity-[0.06] [filter:brightness(0)_invert(1)]"
      />

      <div className="relative z-10 mb-[18px] flex items-center gap-2.5 border-b border-white/15 px-1.5 pb-[22px]">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white p-1">
          <Image src="/brand/crest.png" alt="Sporting Clube de Braga" width={34} height={34} className="h-full w-full object-contain" />
        </div>
        <div className="font-condensed leading-[1.15]">
          <div className="text-[13px] font-bold tracking-wide">SC Braga Masters</div>
          <div className="text-[11px] uppercase tracking-wider text-white/60">Backoffice</div>
        </div>
      </div>

      <nav className="relative z-10 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 font-condensed text-sm font-semibold tracking-wide ${
                active ? "bg-white/12 text-white" : "text-white/72 hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className="h-[17px] w-[17px] shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 mt-auto flex items-center gap-2.5 border-t border-white/15 pt-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 font-display text-[13px] font-bold">
          {initials}
        </div>
        <div className="min-w-0 flex-1 font-condensed">
          <div className="truncate text-[12.5px] font-semibold">{fullName}</div>
          <Link href="/profile" className="text-[10.5px] text-white/55 hover:text-white/80">
            Perfil
          </Link>
          {" · "}
          <form action="/auth/signout" method="post" className="inline">
            <button type="submit" className="text-[10.5px] text-white/55 hover:text-white/80">
              Sair
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
