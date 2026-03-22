import { SummaryForm } from "@/features/summaries/summary-form";

export default function SummariesPage() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Summary Sheets</h2>
        <p className="text-slate-600">Generate concise revision notes for any math topic.</p>
      </header>
      <SummaryForm />
    </section>
  );
}
