"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertEnv, env } from "@/lib/env";

assertEnv();

export function createClient() {
  return createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!);
}
