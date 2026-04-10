"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  ChevronRight,
  Archive,
} from "lucide-react";
import { COMPANY } from "@/lib/mockData";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard AO" },
  { href: "/documents",  icon: FolderOpen,       label: "Bibliothèque" },
  { href: "/archive",    icon: Archive,           label: "Archives & Stats" },
  { href: "/profile",    icon: Settings,          label: "Paramètres" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-52 shrink-0 bg-[#111113] flex flex-col min-h-screen border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white/5">
            <Image src="/logo-nerolia.png" alt="Nerolia" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Nerolia</div>
            <div className="text-white/30 text-[10px] mt-0.5">Appels d'offres</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href === "/dashboard" && path === "/");
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}>
              <Icon size={15} className={active ? "text-indigo-400" : "text-current"} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto text-white/20" />}
            </Link>
          );
        })}
      </nav>

      {/* Séparateur AO urgent */}
      <div className="mx-3 mb-3 rounded-xl border border-red-500/20 bg-red-500/8 p-3">
        <div className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-1">
          Urgent — J-3
        </div>
        <Link href="/ao/3"
          className="text-xs text-white/60 hover:text-white transition-colors leading-snug block">
          Bureaux CPAM Nord
        </Link>
        <div className="text-[10px] text-white/30 mt-1">Score IA : 98%</div>
      </div>

      {/* Company */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">ES</span>
          </div>
          <div className="min-w-0">
            <div className="text-white/70 text-xs font-medium truncate">S DECO</div>
            <div className="text-white/30 text-[10px] truncate">TPE — Maisons-Alfort (94)</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
