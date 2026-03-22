"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateMockSummary } from "@/features/summaries/mock";

export function SummaryForm() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Generate summary sheet</h3>
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Derivatives" />
        <Button onClick={() => setSummary(generateMockSummary(topic || "General math topic"))}>Generate summary</Button>
      </Card>
      {summary && (
        <Card>
          <h4 className="mb-2 font-semibold">Mock summary</h4>
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{summary}</pre>
        </Card>
      )}
    </section>
  );
}
