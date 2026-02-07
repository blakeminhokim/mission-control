"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Calendar", icon: "📅" },
  { href: "/activity", label: "Activity", icon: "📊", disabled: true },
  { href: "/search", label: "Search", icon: "🔍", disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span> Mission Control
        </h1>
        <p className="text-xs text-gray-500 mt-1">OpenClaw Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                {item.disabled ? (
                  <span className="flex items-center gap-3 px-3 py-2 rounded text-gray-600 cursor-not-allowed">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="text-xs ml-auto">(soon)</span>
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          <div>Agent: main</div>
          <div>Status: Online</div>
        </div>
      </div>
    </aside>
  );
}
