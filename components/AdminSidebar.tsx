"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview"},
  { href: "/users", label: "Users"},
  { href: "/media", label: "Media"},
  { href: "/votes", label: "Votes"},
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
        <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center font-bold text-black">
          H
        </div>
        <span className="font-semibold text-white">Humor Admin</span>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm ${
                isActive
                  ? "bg-yellow-400/10 text-yellow-400 border-l-2 border-yellow-400 font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}