"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { resources } from "@/lib/resources";

const navItems = [
  { href: "/", label: "Overview"},
  { href: "/users", label: "Users"},
  { href: "/media", label: "Media"},
  { href: "/votes", label: "Votes"},
];

const groups = Array.from(new Set(resources.map((r) => r.group)));

export default function AdminSidebar() {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-5 py-2 text-sm ${
      active
        ? "bg-yellow-400/10 text-yellow-400 border-l-2 border-yellow-400 font-medium"
        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
    }`;

  return (
    <aside className="w-60 min-h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
        <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center font-bold text-black">
          H
        </div>
        <span className="font-semibold text-white">Humor Admin</span>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(pathname === item.href)}>
            {item.label}
          </Link>
        ))}

        {groups.map((group) => (
          <div key={group} className="mt-5">
            <p className="px-5 mb-1 text-xs uppercase tracking-wide text-zinc-600">{group}</p>
            {resources
              .filter((r) => r.group === group)
              .map((r) => {
                const href = `/resources/${r.slug}`;
                return (
                  <Link key={r.slug} href={href} className={linkClass(pathname === href)}>
                    {r.title}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
    </aside>
  );
}