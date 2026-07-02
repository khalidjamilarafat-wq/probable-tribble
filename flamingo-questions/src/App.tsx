import { useMemo, useState } from "react";
import { categories, questions } from "./data/questions";
import CategoryGrid from "./components/CategoryGrid";
import QuestionCard from "./components/QuestionCard";
import FavoritesView from "./components/FavoritesView";
import { useFavorites } from "./hooks/useFavorites";

type View = { screen: "home" } | { screen: "deck"; categoryId: string | "all" } | { screen: "favorites" };

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
  const [view, setView] = useState<View>({ screen: "home" });
  const [index, setIndex] = useState(0);
  const [deck, setDeck] = useState<typeof questions>([]);
  const [pendingMature, setPendingMature] = useState<string | null>(null);
  const [matureConfirmed, setMatureConfirmed] = useState(false);
  const { favorites, toggle, remove } = useFavorites();

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), []);

  function openDeck(categoryId: string | "all") {
    const pool = categoryId === "all" ? questions : questions.filter((q) => q.categoryId === categoryId);
    setDeck(shuffle(pool));
    setIndex(0);
    setView({ screen: "deck", categoryId });
  }

  function startDeck(categoryId: string | "all") {
    const category = categoryId !== "all" ? categoryById[categoryId] : undefined;
    if (category?.mature && !matureConfirmed) {
      setPendingMature(categoryId);
      return;
    }
    openDeck(categoryId);
  }

  function next() {
    setIndex((i) => (i + 1 >= deck.length ? 0 : i + 1));
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  if (view.screen === "favorites") {
    return (
      <FavoritesView
        favoriteIds={favorites}
        onRemove={remove}
        onHome={() => setView({ screen: "home" })}
      />
    );
  }

  if (view.screen === "deck" && deck.length > 0) {
    const q = deck[index];
    return (
      <QuestionCard
        question={q}
        category={categoryById[q.categoryId]}
        index={index}
        total={deck.length}
        isFavorite={favorites.has(q.id)}
        onToggleFavorite={() => toggle(q.id)}
        onNext={next}
        onPrev={prev}
        onHome={() => setView({ screen: "home" })}
      />
    );
  }

  return (
    <>
      <CategoryGrid
        onSelect={startDeck}
        favoritesCount={favorites.size}
        onOpenFavorites={() => setView({ screen: "favorites" })}
      />
      {pendingMature && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="text-3xl">🔥</div>
            <h3 className="mt-2 text-lg font-bold text-gray-800">18+ content</h3>
            <p className="mt-1 text-sm text-gray-500">
              This deck has flirty, adult questions meant for consenting partners. Continue?
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMatureConfirmed(true);
                  const categoryId = pendingMature;
                  setPendingMature(null);
                  openDeck(categoryId);
                }}
                className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                I'm 18+, continue
              </button>
              <button
                onClick={() => setPendingMature(null)}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
