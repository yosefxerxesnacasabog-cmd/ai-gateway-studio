import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BookOpen, ClipboardList, House, SquarePen } from "lucide-react";

import { AppShell, type NavItem } from "@/components/anisuri/shell";
import { VoiceProvider } from "@/components/anisuri/voice";
import { currentFarmerName } from "@/lib/demo/actions";
import { useDemoState } from "@/lib/demo/store";

export const Route = createFileRoute("/farmer")({
  component: FarmerLayout,
});

const ITEMS: NavItem[] = [
  { to: "/farmer", label: "Home", icon: House, exact: true },
  { to: "/farmer/guide", label: "Guide", icon: BookOpen, also: ["/farmer/buyers"] },
  { to: "/farmer/request", label: "Request", icon: SquarePen },
  { to: "/farmer/assessments", label: "My Assessments", icon: ClipboardList },
];

function FarmerLayout() {
  const state = useDemoState();
  return (
    <VoiceProvider>
      <AppShell
        items={ITEMS}
        who={currentFarmerName(state)}
        roleLabel="Farmer"
        bottomNav
      >
        <Outlet />
      </AppShell>
    </VoiceProvider>
  );
}
