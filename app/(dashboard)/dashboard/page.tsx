import Link from "next/link";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/features/dashboard/service";

function typeLabel(type: "course" | "level" | "summary") {
  if (type === "course") return "Exercices par cours";
  if (type === "level") return "Exercices par niveau";
  return "Fiche révision";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const data = await getDashboardData(user.id);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-5">
        <h2 className="text-2xl font-bold">Welcome back 👋</h2>
        <p className="text-slate-600">Suivi des documents, générations et crédits LearningFaster.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-100">
          <p className="text-sm text-slate-500">Nombre d&apos;exercices générés</p>
          <p className="text-3xl font-bold text-orange-600">{data.totalGenerated}</p>
        </Card>
        <Card className="border-orange-100">
          <p className="text-sm text-slate-500">Nombre de cours transformés en fiche</p>
          <p className="text-3xl font-bold text-orange-600">{data.totalSheets}</p>
        </Card>
        <Card className="border-orange-100">
          <p className="text-sm text-slate-500">Crédits disponibles</p>
          <p className="text-3xl font-bold text-orange-600">{data.credits}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Derniers PDFs</h3>
            <Link href="/pdf-library" className="text-sm text-orange-600 underline">
              View all
            </Link>
          </div>
          {data.recentPdfs.length ? (
            <ul className="space-y-2">
              {data.recentPdfs.map((pdf) => {
                const hasGeneration = data.generatedPdfIds.has(pdf.id);
                return (
                  <li key={pdf.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm">
                    <p className="font-medium">{pdf.title}</p>
                    <p className="text-xs text-orange-600">{pdf.chapter ?? "Sans chapitre"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link href={`/pdf-library/${pdf.id}`} className="text-orange-600 underline">
                        Visualiser
                      </Link>
                      {!hasGeneration ? (
                        <Link href="/exercises/course" className="rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
                          Générer maintenant
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Aucun PDF pour le moment.</p>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Dernières générations</h3>
          </div>
          {data.recentGenerations.length ? (
            <ul className="space-y-2">
              {data.recentGenerations.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-orange-600">
                    {typeLabel(item.type)} • {item.chapter}
                  </p>
                  <a href={item.href} className="mt-1 inline-flex text-orange-600 underline">
                    Ouvrir
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Aucune génération enregistrée.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {([
          ["/exercises/course", "Exercises by course"],
          ["/exercises/level", "Exercises by level"],
          ["/summaries", "Summary sheets"]
        ] as const).map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow"
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
