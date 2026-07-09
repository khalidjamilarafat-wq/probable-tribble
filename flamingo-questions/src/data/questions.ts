import { warmup } from "./warmup";
import { know } from "./know";
import { deep } from "./deep";
import { playful } from "./playful";
import { romance } from "./romance";
import { future } from "./future";
import { trust } from "./trust";
import { conflict } from "./conflict";
import { spicyQ } from "./spicyq";
import { dares } from "./dares";
import { special } from "./special";
import { dontenter } from "./dontenter";
import { funny } from "./funny";

export type Category = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
  mature?: boolean;
};

export type Question = {
  id: string;
  categoryId: string;
  text: string;
  /** Arabic translation, shown via the in-card translate button. */
  ar?: string;
};

export const categories: Category[] = [
  {
    id: "warmup",
    label: "Warm Up",
    emoji: "☀️",
    description: "Light, easy questions to break the ice.",
    color: "#fbbf24",
  },
  {
    id: "know",
    label: "Getting to Know You",
    emoji: "🌱",
    description: "The basics that build a fuller picture of each other.",
    color: "#34d399",
  },
  {
    id: "deep",
    label: "Deep Connection",
    emoji: "💭",
    description: "Values, fears, and what really matters.",
    color: "#818cf8",
  },
  {
    id: "playful",
    label: "Fun & Playful",
    emoji: "🎉",
    description: "Silly, lighthearted questions to make you both laugh.",
    color: "#fb923c",
  },
  {
    id: "funny",
    label: "Funny Dares",
    emoji: "😂",
    description: "Easy, silly dares to make you both laugh.",
    color: "#f59e0b",
  },
  {
    id: "romance",
    label: "Date Night",
    emoji: "🌹",
    description: "Romance, attraction, and what makes you feel loved.",
    color: "#f13a78",
  },
  {
    id: "future",
    label: "Future Together",
    emoji: "🔮",
    description: "Dreams, goals, and where you're headed.",
    color: "#22d3ee",
  },
  {
    id: "trust",
    label: "Trust & Vulnerability",
    emoji: "🤍",
    description: "Closeness, honesty, and being truly seen.",
    color: "#a78bfa",
  },
  {
    id: "conflict",
    label: "Communication",
    emoji: "🗝️",
    description: "How you handle friction and support each other.",
    color: "#60a5fa",
  },
  {
    id: "spicy",
    label: "Spicy & Hot",
    emoji: "🔥",
    description: "Turn up the heat — desire, fantasies, and what turns you on. 18+",
    color: "#dc2626",
    mature: true,
  },
  {
    id: "dares",
    label: "Dares",
    emoji: "😈🔥",
    description: "Bold dares only — daring challenges, confessions, and the forbidden round. 18+",
    color: "#9333ea",
    mature: true,
  },
];

export const questions: Question[] = [
  ...warmup,
  ...know,
  ...deep,
  ...playful,
  ...funny,
  ...romance,
  ...future,
  ...trust,
  ...conflict,
  ...spicyQ,
  ...dares,
  ...special,
  ...dontenter,
];
