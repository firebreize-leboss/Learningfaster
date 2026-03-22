"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface TopbarProps {
  email?: string;
}

export function Topbar({ email }: TopbarProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  return (
    <header className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-600">Signed in as <span className="font-medium text-slate-900">{email ?? "user"}</span></p>
      <Button variant="secondary" onClick={handleSignOut} disabled={loading}>
        {loading ? "Signing out..." : "Sign out"}
      </Button>
    </header>
  );
}
