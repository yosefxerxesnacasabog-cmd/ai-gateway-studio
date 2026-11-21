import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogIn, Sprout, Store, UserPlus } from "lucide-react";

import heroAsset from "@/assets/hero-farmer.jpg.asset.json";
import { Logo } from "@/components/anisuri/logo";
import { Button } from "@/components/ui/button";
import { updateDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AniSuri — Check buyer grading before you deliver" },
      {
        name: "description",
        content:
          "AniSuri helps farmers in Cotabato see participating buyers' grading requirements and request a preliminary inspection before transporting their harvest.",
      },
      { property: "og:title", content: "AniSuri — Check buyer grading before you deliver" },
      {
        property: "og:description",
        content: "A farm-gate grading guide and preliminary assessment request app for corn, palay and rubber.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const explore = () => {
    updateDemo((s) => ({ ...s, session: { role: "guest" } }));
    void navigate({ to: "/farmer" });
  };
  const trader = () => {
    updateDemo((s) => ({ ...s, session: { role: "trader" } }));
    void navigate({ to: "/trader" });
  };

  return (
    <main className="min-h-screen bg-background md:grid md:grid-cols-2">
      <div className="relative h-[42vh] min-h-72 overflow-hidden md:sticky md:top-0 md:h-screen">
        <img
          src={heroAsset.url}
          alt="A farmer in a straw hat inspecting a dried corn cob in his field"
          className="absolute inset-0 h-full w-full object-cover object-[70%_30%]"
        />
        <div className="hero-fade absolute inset-0" aria-hidden="true" />
      </div>

      <div className="relative -mt-8 rounded-t-3xl bg-background px-5 pb-10 pt-7 md:mt-0 md:flex md:flex-col md:justify-center md:rounded-none md:px-14">
        <div className="mx-auto w-full max-w-md">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Know the grade before the trip.
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            See what participating buyers look for in corn, palay and rubber, and ask for a preliminary inspection
            before you transport and sell your harvest.
          </p>

          <div className="mt-8 space-y-3">
            <Button asChild size="lg" className="w-full justify-between">
              <Link to="/register">
                <span className="flex items-center gap-2">
                  <UserPlus /> Create a farmer account
                </span>
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full justify-between">
              <Link to="/sign-in">
                <span className="flex items-center gap-2">
                  <LogIn /> Sign in
                </span>
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="soft" className="w-full justify-between" onClick={explore}>
              <span className="flex items-center gap-2">
                <Sprout /> Explore as farmer, no account
              </span>
              <ArrowRight />
            </Button>
          </div>

          <div className="mt-8 border-t border-border pt-5">
            <p className="text-sm font-semibold text-muted-foreground">Are you a trader or buyer?</p>
            <Button variant="ghost" className="-ml-3 mt-1 text-primary" onClick={trader}>
              <Store /> Continue as trader or buyer
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Demonstration app. No email needed. Data stays on this device only.
          </p>
        </div>
      </div>
    </main>
  );
}
