"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { CREDIT_COSTS } from "@/lib/credits";
import { createClient } from "@/lib/supabase/client";
import type { DifficultyLevel } from "@/types";
import { generateMockLevelExercises } from "@/features/exercises/mock";

type LevelExerciseFormProps = {
  userId: string;
};

export function LevelExerciseForm({ userId }: LevelExerciseFormProps) {
  const supabase = createClient();
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [items, setItems] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error: creditError } = await supabase.rpc("consume_credits", {
        p_user_id: userId,
        p_cost: CREDIT_COSTS.exerciseByLevel
      });

      if (creditError) {
        setMessage("Crédits insuffisants pour générer ces exercices.");
        return;
      }

      setItems(generateMockLevelExercises(level));
      setMessage("Exercices générés (mode mock).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Generate exercises by level</h3>
        <p className="text-sm text-slate-600">Cette génération coûte {CREDIT_COSTS.exerciseByLevel} crédit.</p>
        <Select value={level} onChange={(e) => setLevel(Number(e.target.value) as DifficultyLevel)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              Level {value}
            </option>
          ))}
        </Select>
        <Button onClick={onGenerate} disabled={loading}>
          {loading ? "Generation..." : "Generate"}
        </Button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </Card>
      {items.length > 0 && (
        <Card>
          <h4 className="mb-2 font-semibold">Mock exercises</h4>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
