import { useMemo, useState } from "react";
import { categories, questions } from "./data/questions";
import CategoryGrid from "./components/CategoryGrid";
import QuestionCard from "./components/QuestionCard";
import FavoritesView from "./components/FavoritesView";
import PlayersModal from "./components/PlayersModal";
import { useFavorites } from "./hooks/useFavorites";
import { Players, loadPlayers, savePlayers, usesNames } from "./lib/players";

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
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [players, setPlayers] = useState<Players | null>(() => loadPlayers());
  const [pendingNames, setPendingNames] = useState<string | null>(null);
  const [editingPlayers, setEditingPlayers] = useState(false);
  const { favorites, toggle, remove } = useFavorites();

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), []);

  function poolFor(categoryId: string | "all") {
    // "Shuffle all" stays family-friendly: 18+ decks are only reachable
    // through their own gated categories.
    return categoryId === "all"
      ? questions.filter((q) => !categoryById[q.categoryId]?.mature)
      : questions.filter((q) => q.categoryId === categoryId);
  }

  function openDeck(categoryId: string | "all") {
    setDeck(shuffle(poolFor(categoryId)));
    setIndex(0);
    setView({ screen: "deck", categoryId });
  }

  function startDeck(categoryId: string | "all") {
    const category = categoryId !== "all" ? categoryById[categoryId] : undefined;
    if (category?.mature && !matureConfirmed) {
      setPendingMature(categoryId);
      return;
    }
    proceedAfterGate(categoryId);
  }

  function proceedAfterGate(categoryId: string | "all") {
    const needsNames = poolFor(categoryId).some((q) => usesNames(q.text));
    if (needsNames && !players) {
      setPendingNames(categoryId);
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
        players={players}
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
        players={players}
        onEditPlayers={() => setEditingPlayers(true)}
      />
      {pendingMature && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="text-3xl">🔒</div>
            <h3 className="mt-2 text-lg font-bold text-gray-800">18+ content</h3>
            <p className="mt-1 text-sm text-gray-500">
              This deck is for adults only. Enter the PIN to continue.
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              autoFocus
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setPinError(false);
              }}
              placeholder="• • • •"
              className={`mt-4 w-full rounded-xl border px-3 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 ${
                pinError
                  ? "border-red-400 focus:ring-red-100"
                  : "border-flamingo-200 focus:border-flamingo-400 focus:ring-flamingo-100"
              }`}
            />
            {pinError && <p className="mt-2 text-sm font-medium text-red-500">Wrong PIN — try again.</p>}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (pin === "2458") {
                    setMatureConfirmed(true);
                    setPin("");
                    setPinError(false);
                    const categoryId = pendingMature;
                    setPendingMature(null);
                    proceedAfterGate(categoryId);
                  } else {
                    setPinError(true);
                  }
                }}
                disabled={pin.length < 4}
                className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
              >
                Unlock
              </button>
              <button
                onClick={() => {
                  setPendingMature(null);
                  setPin("");
                  setPinError(false);
                }}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {(pendingNames !== null || editingPlayers) && (
        <PlayersModal
          initial={players}
          onSave={(p) => {
            setPlayers(p);
            savePlayers(p);
            setEditingPlayers(false);
            const categoryId = pendingNames;
            setPendingNames(null);
            if (categoryId !== null) openDeck(categoryId);
          }}
          onCancel={() => {
            setEditingPlayers(false);
            const categoryId = pendingNames;
            setPendingNames(null);
            // Play anyway — cards show a heart where a name would go.
            if (categoryId !== null) openDeck(categoryId);
          }}
        />
      )}
    </>
  );
}
