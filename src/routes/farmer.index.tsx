import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, ClipboardList, SquarePen, Users } from "lucide-react";

import { TipPanel } from "@/components/anisuri/page";
import { StatusBadge } from "@/components/anisuri/status-badge";
import { VoiceLauncher } from "@/components/anisuri/voice";
import { currentFarmerName, farmerSummary } from "@/lib/demo/actions";
import { formatDate, formatQuantity, productName } from "@/lib/demo/format";
import { useDemoState } from "@/lib/demo/store";

export const Route = createFileRoute("/farmer/")({
  head: () => ({
    meta: [
      { title: "Home — AniSuri farmer" },
      { name: "description", content: "Your AniSuri home: grading guide, assessment requests and recent activity." },
      { property: "og:title", content: "Home — AniSuri farmer" },
      { property: "og:description", content: "Check grading requirements and track your preliminary assessments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FarmerHome,
});

function summaryText(s: ReturnType<typeof farmerSummary>) {
  if (s.total === 0) return "No assessment requests yet";
  const parts: string[] = [];
  if (s.inProgress) parts.push(`${s.inProgress} in progress`);
  if (s.ready) parts.push(`${s.ready} result${s.ready === 1 ? "" : "s"} ready`);
  if (s.unavailable) parts.push(`${s.unavailable} unavailable`);
  return parts.join(" · ");
}

function FarmerHome() {
  const state = useDemoState();
  const name = currentFarmerName(state);
  const summary = farmerSummary(state);
  const recent = state.requests.filter((r) => r.farmerKey === "me").slice(0, 3);

  return (
    <div>
      <h1 className="text-[1.75rem] font-bold md:text-3xl">
        Magandang araw, {name === "Guest farmer" ? "farmer" : name}!
      </h1>
      <p className="mt-1 text-lg text-muted-foreground">
        A preliminary assessment helps you check a buyer's requirements before you deliver.
      </p>

      <nav aria-label="Main actions" className="mt-6 grid gap-3">
        <ActionCard
          to="/farmer/guide"
          icon={<BookOpen className="size-6" />}
          title="Grading Guide"
          text="See what each buyer looks for, common defects and grades."
        />
        <ActionCard
          to="/farmer/request"
          icon={<SquarePen className="size-6" />}
          title="Request Assessment"
          text="Ask a buyer to inspect a sample of your harvest."
          primary
        />
        <Link
          to="/farmer/assessments"
          className="focus-ring surface-card flex items-center gap-4 p-4 transition-shadow hover:shadow-lift"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground" aria-hidden="true">
            <ClipboardList className="size-6" />
          </span>
          <span className="flex-1">
            <span className="block text-lg font-bold">My Assessments</span>
            <span className="block text-muted-foreground">{summaryText(summary)}</span>
          </span>
          <ChevronRight className="size-6 text-muted-foreground" aria-hidden="true" />
        </Link>
      </nav>

      <VoiceLauncher className="mt-4" />

      <TipPanel title="Before you bring your harvest" className="mt-6">
        Each buyer has their own requirements. Moisture, cleanliness and defects can change the grade and price. Check
        the guide or ask for an inspection first.{" "}
        <Link to="/farmer/buyers" search={{}} className="inline-flex items-center gap-1 font-bold underline underline-offset-4">
          <Users className="size-4" aria-hidden="true" /> See participating buyers
        </Link>
      </TipPanel>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Your requests will appear here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  to="/farmer/assessments/$requestId"
                  params={{ requestId: r.id }}
                  className="focus-ring flex items-center gap-3 px-4 py-3.5 hover:bg-muted"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">
                      {productName(r.product)} · {formatQuantity(r)}
                    </span>
                    <span className="block truncate text-muted-foreground">
                      {state.buyers.find((b) => b.id === r.buyerId)?.name} · {formatDate(r.submittedAt)}
                    </span>
                  </span>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ActionCard({
  to,
  icon,
  title,
  text,
  primary,
}: {
  to: "/farmer/guide" | "/farmer/request";
  icon: React.ReactNode;
  title: string;
  text: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      search={{}}
      className={
        primary
          ? "focus-ring flex items-center gap-4 rounded-xl bg-primary p-4 text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover"
          : "focus-ring surface-card flex items-center gap-4 p-4 transition-shadow hover:shadow-lift"
      }
    >
      <span
        className={
          primary
            ? "grid size-12 shrink-0 place-items-center rounded-xl bg-primary-foreground/15"
            : "grid size-12 shrink-0 place-items-center rounded-xl bg-leaf-soft text-leaf-foreground"
        }
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-lg font-bold">{title}</span>
        <span className={primary ? "block opacity-90" : "block text-muted-foreground"}>{text}</span>
      </span>
      <ChevronRight className="size-6 opacity-70" aria-hidden="true" />
    </Link>
  );
}
