import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/anisuri/auth-layout";
import { describedBy, Field, fieldClass } from "@/components/anisuri/form";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNT } from "@/lib/demo/seed";
import { getDemoState, updateDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — AniSuri" },
      { name: "description", content: "Sign in to the AniSuri demo with your mobile number and 4-digit PIN." },
      { property: "og:title", content: "Sign in — AniSuri" },
      { property: "og:description", content: "Use your mobile number and PIN to continue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const m = mobile.replace(/[^\d]/g, "");
    const account = getDemoState().accounts.find((a) => a.mobile === m && a.pin === pin);
    if (!account) {
      setError("That mobile number and PIN do not match. Try the sample details below.");
      return;
    }
    updateDemo((s) => ({ ...s, session: { role: "farmer", mobile: m } }));
    toast.success(`Welcome back, ${account.name}!`);
    void navigate({ to: "/farmer" });
  };

  return (
    <AuthLayout title="Sign in" intro="Enter the mobile number and PIN you used when you created your account.">
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field id="mobile" label="Mobile number" error={null}>
          <input
            id="mobile"
            className={fieldClass}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
        <Field id="pin" label="4-digit PIN" error={error}>
          <input
            id="pin"
            className={`${fieldClass} tracking-[0.5em]`}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            type="password"
            autoComplete="current-password"
            maxLength={4}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy("pin", false, error)}
          />
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <p className="font-bold">Sample account for trying the demo</p>
        <p className="mt-1 text-muted-foreground">
          Mobile <span className="font-bold text-foreground">0917 123 4567</span> · PIN{" "}
          <span className="font-bold text-foreground">{DEMO_ACCOUNT.pin}</span>
        </p>
        <Button
          variant="soft"
          className="mt-3 w-full"
          onClick={() => {
            setMobile("0917 123 4567");
            setPin(DEMO_ACCOUNT.pin);
            setError(null);
          }}
        >
          <Wand2 /> Fill sample details
        </Button>
      </div>
      <p className="mt-6 text-center">
        New here?{" "}
        <Link to="/register" className="font-bold text-primary underline underline-offset-4">
          Create a farmer account
        </Link>
      </p>
    </AuthLayout>
  );
}
