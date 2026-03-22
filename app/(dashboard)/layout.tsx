import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-h-screen flex-1 p-4 md:p-8">
        <Topbar email={user.email} />
        {children}
      </main>
    </div>
  );
}
