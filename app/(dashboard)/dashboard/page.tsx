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
      <header className="rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-5">
        <h2 className="text-2xl font-bold">Welcome back 👋</h2>
        <p className="text-slate-600">Track your progress and jump into your learning modes.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-brand-100">
          <p className="text-sm text-slate-500">Nombre d&apos;exercices générés</p>
          <p className="text-3xl font-bold text-brand-700">{data.totalGenerated}</p>
        </Card>
        <Card className="border-brand-100">
          <p className="text-sm text-slate-500">Nombre de cours transformés en fiche</p>
          <p className="text-3xl font-bold text-brand-700">{data.totalSheets}</p>
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
              <li key={pdf.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{pdf.title}</p>
                    {pdf.chapter ? <p className="text-xs text-brand-700">Chapitre: {pdf.chapter}</p> : null}
                    <p className="text-slate-500">{new Date(pdf.created_at).toLocaleDateString()}</p>
                  </div>
                  <Link
                    href={`/pdf-library/${pdf.id}`}
                    className="inline-flex items-center rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Visualiser le PDF
                  </Link>
                </div>
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
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow"
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
