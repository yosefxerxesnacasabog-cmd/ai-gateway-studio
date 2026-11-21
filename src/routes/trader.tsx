import { TraderBoard } from "@/components/anisuri/harvest-posts";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Archive, BookOpen, House, Inbox } from "lucide-react";

import { AppShell, type NavItem } from "@/components/anisuri/shell";
import { useDemoState } from "@/lib/demo/store";

export const Route = createFileRoute("/trader")({
  component: TraderLayout,
});

const ITEMS: NavItem[] = [
  { to: "/trader", label: "Home", icon: House, exact: true },
  { to: "/trader/guides", label: "Grading Guides", icon: BookOpen },
  { to: "/trader/requests", label: "Assessment Requests", icon: Inbox },
  { to: "/trader/records", label: "Records", icon: Archive },
];

function TraderLayout() {
  const { pathname } = useLocation();
  const state = useDemoState();
  const buyer = state.buyers.find((b) => b.id === state.traderBuyerId);
  return (
    <AppShell items={ITEMS} who={buyer?.name ?? "Demo trader"} roleLabel="Trader / buyer" bottomNav={false}>
      {["/trader", "/trader/requests"].includes(pathname.replace(/\/$/, "")) && <TraderBoard />}
      <Outlet />
    </AppShell>
  );
}
