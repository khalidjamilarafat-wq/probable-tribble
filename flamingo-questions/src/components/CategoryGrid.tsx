import { categories } from "../data/questions";
import { Players } from "../lib/players";

type Props = {
  onSelect: (categoryId: string | "all") => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  players: Players | null;
  onEditPlayers: () => void;
};

export default function CategoryGrid({
  onSelect,
  favoritesCount,
  onOpenFavorites,
  players,
  onEditPlayers,
}: Props) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="text-center">
        <div className="text-5xl">🦩</div>
        <h1 className="mt-2 text-3xl font-bold text-flamingo-700">Flamingo Questions</h1>
        <p className="mt-1 text-flamingo-900/60">
          A deck of conversation starters to help you two connect.
        </p>
      </header>

      <button
        onClick={() => onSelect("all")}
        className="rounded-2xl bg-flamingo-500 px-6 py-4 text-lg font-semibold text-white shadow-md shadow-flamingo-500/30 transition hover:bg-flamingo-600 active:scale-[0.98]"
      >
        🔀 Shuffle all questions
      </button>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="relative flex flex-col items-start gap-1 rounded-2xl border border-flamingo-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          >
            {cat.mature && (
              <span className="absolute right-3 top-3 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                18+
              </span>
            )}
            <span className="text-2xl">{cat.emoji}</span>
            <span className="font-semibold text-gray-800">{cat.label}</span>
            <span className="text-xs text-gray-500">{cat.description}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenFavorites}
        className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-flamingo-200 bg-white px-6 py-3 font-medium text-flamingo-700 transition hover:bg-flamingo-50"
      >
        ❤️ Saved questions {favoritesCount > 0 ? `(${favoritesCount})` : ""}
      </button>

      <button
        onClick={onEditPlayers}
        className="flex items-center justify-center gap-2 rounded-2xl border border-flamingo-200 bg-white px-6 py-3 font-medium text-flamingo-700 transition hover:bg-flamingo-50"
      >
        👩‍❤️‍👨 Players{players ? `: ${players.g} & ${players.b}` : ""}
      </button>
    </div>
  );
}
