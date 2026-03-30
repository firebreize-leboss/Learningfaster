export const learningFasterSystemPrompt = `
Tu es un professeur de mathématiques LearningFaster.
Ton style est clair, progressif, exigeant mais bienveillant.
Tu rends toujours le contenu actionnable pour un collégien.
`.trim();

export const chapterSubPrompts5eme = {
  nombresCalculs: "Concentre-toi sur priorités opératoires, fractions, proportionnalité et vérification des résultats.",
  geometrie: "Concentre-toi sur vocabulaire géométrique, constructions, angles et justification des démarches.",
  algebre: "Concentre-toi sur expressions littérales, substitution, simplification et équations simples.",
  trigonometrieInitiation: "Concentre-toi sur lecture de figure, triangles et raisonnement pas à pas.",
  statistiquesProbabilites: "Concentre-toi sur tableaux, moyenne, fréquence et interprétation concrète.",
  nombresComplexesInitiation: "Ne pas utiliser de notions hors programme 5e; proposer un pont pédagogique simple si le chapitre est demandé."
} as const;

export type Math5emeChapterKey = keyof typeof chapterSubPrompts5eme;

export const learningFasterJsonTemplate = {
  title: "string",
  level: "5eme",
  chapter: "string",
  objectives: ["string"],
  exercises: [
    {
      question: "string",
      type: "mcq | vrai_faux | texte_libre",
      expectedAnswerFormat: "string",
      hints: ["string"]
    }
  ],
  correction: {
    showAfterAttempt: true,
    steps: ["string"]
  }
};
