"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
    } else {
      setConfirmSent(true);
    }
  }

  if (confirmSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Check your email</h1>
          <p className="mt-3 text-sm text-graphite">
            We sent a confirmation link to {email}. Confirm your address, then log in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-ink underline underline-offset-4"
          >
            Go to log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
          Forge
        </Link>
        <h1 className="font-display mt-8 text-2xl font-bold tracking-tight text-ink">Create your profile</h1>
        <p className="mt-1 text-sm text-graphite">Set up your account in under a minute.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </Field>
          <Field label="Password" hint="At least 6 characters.">
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Your Profile"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-graphite">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
