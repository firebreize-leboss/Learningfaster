import Link from "next/link";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/features/dashboard/service";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const data = await getDashboardData(user.id);

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Welcome back 👋</h2>
        <p className="text-slate-600">Track your progress and jump into your learning modes.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Exercises generated</p>
          <p className="text-3xl font-bold">{data.totalGenerated}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Exercises completed</p>
          <p className="text-3xl font-bold">{data.totalCompleted}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent PDFs</h3>
          <Link href="/pdf-library" className="text-sm text-brand-700 underline">
            View all
          </Link>
        </div>
        {data.recentPdfs.length ? (
          <ul className="space-y-2">
            {data.recentPdfs.map((pdf) => (
              <li key={pdf.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-medium">{pdf.title}</p>
                <p className="text-slate-500">{new Date(pdf.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No PDFs uploaded yet.</p>
        )}
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {([
          ["/exercises/course", "Exercises by course"],
          ["/exercises/level", "Exercises by level"],
          ["/summaries", "Summary sheets"]
        ] as const).map(([href, label]) => (
          <Link key={href} href={href} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium hover:border-brand-500">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
