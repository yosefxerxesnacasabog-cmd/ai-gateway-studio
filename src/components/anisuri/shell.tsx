import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { updateDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

export type NavItem = {
  to: "/farmer" | "/farmer/guide" | "/farmer/request" | "/farmer/assessments" | "/trader" | "/trader/guides" | "/trader/requests" | "/trader/records";
  label: string;
  icon: LucideIcon;
  /** Extra path prefixes that count as this destination. */
  also?: string[];
  exact?: boolean;
};

function isActive(pathname: string, item: NavItem) {
  const path = pathname.replace(/\/$/, "") || "/";
  if (item.exact) return path === item.to;
  return [item.to, ...(item.also ?? [])].some((p) => path === p || path.startsWith(`${p}/`));
}

export function AppShell({
  items,
  who,
  roleLabel,
  children,
  bottomNav,
}: {
  items: NavItem[];
  who: string;
  roleLabel: string;
  children: ReactNode;
  bottomNav: boolean;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signOut = () => {
    updateDemo((s) => ({ ...s, session: { role: "none" } }));
    void navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background md:pl-64">
      {/* Side rail on larger screens */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <Link to="/" className="focus-ring rounded-lg px-2" aria-label="AniSuri welcome screen">
          <Logo />
        </Link>
        <p className="mt-1 px-2 text-sm text-muted-foreground">{roleLabel}</p>
        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          {items.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-border bg-card p-3">
          <p className="text-sm text-muted-foreground">Using as</p>
          <p className="font-bold">{who}</p>
          <Button variant="ghost" size="sm" className="-ml-2 mt-1" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>
      </aside>

      {/* Top bar on phones */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur md:hidden">
        <Link to="/" className="focus-ring rounded-lg" aria-label="AniSuri welcome screen">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <span className="max-w-32 truncate text-sm font-semibold text-muted-foreground">{who}</span>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut />
          </Button>
        </div>
      </header>

      {!bottomNav && (
        <nav aria-label="Main" className="sticky top-[3.6rem] z-20 border-b border-border bg-background/95 backdrop-blur md:hidden">
          <div className="flex gap-1 overflow-x-auto px-3 py-2">
            {items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-bold",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <main className={cn("mx-auto max-w-3xl px-4 pt-5 md:px-8 md:pb-16 md:pt-10", bottomNav ? "pb-nav-safe" : "pb-16")}>
        {children}
      </main>

      {bottomNav && (
        <nav
          aria-label="Main"
          className="nav-safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card shadow-lift md:hidden"
        >
          <ul className="grid grid-cols-4">
            {items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring flex min-h-[4.5rem] flex-col items-center justify-center gap-1 px-1 text-[0.8125rem] font-bold leading-tight",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-14 place-items-center rounded-full transition-colors",
                        active ? "bg-leaf-soft" : "bg-transparent",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
