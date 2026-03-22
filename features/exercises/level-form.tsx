"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { generateMockLevelExercises } from "@/features/exercises/mock";
import type { DifficultyLevel } from "@/types";

export function LevelExerciseForm() {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [items, setItems] = useState<string[]>([]);

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Generate exercises by level (1-5)</h3>
        <Select value={level} onChange={(e) => setLevel(Number(e.target.value) as DifficultyLevel)}>
          {[1, 2, 3, 4, 5].map((item) => (
            <option key={item} value={item}>
              Level {item}
            </option>
          ))}
        </Select>
        <Button onClick={() => setItems(generateMockLevelExercises(level))}>Generate</Button>
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
