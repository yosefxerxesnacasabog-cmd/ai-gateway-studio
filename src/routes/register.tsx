import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/anisuri/auth-layout";
import { describedBy, Field, fieldClass } from "@/components/anisuri/form";
import { Button } from "@/components/ui/button";
import { updateDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create a farmer account — AniSuri" },
      { name: "description", content: "Create a demo AniSuri farmer account with a mobile number and a 4-digit PIN." },
      { property: "og:title", content: "Create a farmer account — AniSuri" },
      { property: "og:description", content: "Sign up with a mobile number and PIN. No email needed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Register,
});

const cleanMobile = (v: string) => v.replace(/[^\d]/g, "");

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next["name"] = "Please enter your name or nickname.";
    if (!/^09\d{9}$/.test(cleanMobile(mobile))) next["mobile"] = "Enter an 11-digit mobile number starting with 09.";
    if (!/^\d{4}$/.test(pin)) next["pin"] = "The PIN must be exactly 4 numbers.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const m = cleanMobile(mobile);
    updateDemo((s) => ({
      ...s,
      accounts: [...s.accounts.filter((a) => a.mobile !== m), { name: name.trim(), mobile: m, pin }],
      session: { role: "farmer", mobile: m },
    }));
    toast.success(`Welcome, ${name.trim()}! Your demo account is ready.`);
    void navigate({ to: "/farmer" });
  };

  return (
    <AuthLayout title="Create a farmer account" intro="Only three details. You will use your mobile number and PIN to sign in.">
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field id="name" label="Name or nickname" hint="This is what buyers will see on your requests." error={errors["name"]}>
          <input
            id="name"
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="nickname"
            aria-invalid={Boolean(errors["name"])}
            aria-describedby={describedBy("name", true, errors["name"])}
          />
        </Field>
        <Field id="mobile" label="Mobile number" hint="Example: 0917 123 4567" error={errors["mobile"]}>
          <input
            id="mobile"
            className={fieldClass}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors["mobile"])}
            aria-describedby={describedBy("mobile", true, errors["mobile"])}
          />
        </Field>
        <Field id="pin" label="Choose a 4-digit PIN" hint="Easy for you to remember, hard for others to guess." error={errors["pin"]}>
          <input
            id="pin"
            className={`${fieldClass} tracking-[0.5em]`}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            type="password"
            autoComplete="new-password"
            maxLength={4}
            aria-invalid={Boolean(errors["pin"])}
            aria-describedby={describedBy("pin", true, errors["pin"])}
          />
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Create account
        </Button>
        <p className="text-center">
          Already have an account?{" "}
          <Link to="/sign-in" className="font-bold text-primary underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
