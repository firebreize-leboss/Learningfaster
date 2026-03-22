"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(mode === "signup" ? "Account created. Check your email if confirmation is enabled." : "Signed in.");
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold">Welcome to LearningFaster</h1>
      <p className="mb-6 text-sm text-slate-600">Math learning MVP — authentication and dashboard included.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}

      <button
        type="button"
        className="mt-4 text-sm text-brand-700 underline"
        onClick={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
