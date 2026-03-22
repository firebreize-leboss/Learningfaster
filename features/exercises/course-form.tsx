"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateMockCourseExercises } from "@/features/exercises/mock";

export function CourseExerciseForm() {
  const [course, setCourse] = useState("");
  const [items, setItems] = useState<string[]>([]);

  const onGenerate = () => {
    if (!course.trim()) return;
    setItems(generateMockCourseExercises(course));
  };

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Generate exercises by course/chapter</h3>
        <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Linear Algebra - Matrices" />
        <Button onClick={onGenerate}>Generate</Button>
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
