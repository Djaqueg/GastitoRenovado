"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/Button";

interface AppShellProps {
  children: ReactNode;
  onNewMovement: () => void;
  title: string;
  subtitle?: string;
  headerExtra?: ReactNode;
}

export function AppShell({
  children,
  onNewMovement,
  title,
  subtitle,
  headerExtra,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar onNewMovement={onNewMovement} />

      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
            G
          </div>
          <span className="font-bold text-gray-900">GAStito</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`rounded-lg px-2 py-1 text-xs font-medium ${
              pathname === "/"
                ? "bg-primary-mint text-primary"
                : "text-gray-500"
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/presupuesto"
            className={`rounded-lg px-2 py-1 text-xs font-medium ${
              pathname === "/presupuesto"
                ? "bg-primary-mint text-primary"
                : "text-gray-500"
            }`}
          >
            Presupuesto
          </Link>
          <Button onClick={onNewMovement} className="!px-3 !py-2 text-sm">
            + Nuevo
          </Button>
        </div>
      </div>

      <main className="min-h-screen p-4 md:ml-60 md:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {headerExtra && <div className="w-full md:w-auto">{headerExtra}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
