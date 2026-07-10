import { categories, questions } from "../data/questions";

type Props = {
  favoriteIds: Set<string>;
  onRemove: (id: string) => void;
  onHome: () => void;
};

export default function FavoritesView({ favoriteIds, onRemove, onHome }: Props) {
  const saved = questions.filter((q) => favoriteIds.has(q.id));
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <button onClick={onHome} className="text-sm font-medium text-flamingo-700 hover:underline">
          ← Categories
        </button>
        <h2 className="font-semibold text-gray-700">Saved questions</h2>
      </div>

      {saved.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <div className="text-4xl">🤍</div>
          <p className="mt-2">No saved questions yet. Tap the heart on a card to save it.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {saved.map((q) => {
            const cat = categoryById[q.categoryId];
            return (
              <li
                key={q.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-flamingo-100 bg-white p-4 shadow-sm"
              >
                <div>
                  <span
                    className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                  >
                    {cat.emoji} {cat.label}
                  </span>
                  <p className="text-gray-800">{q.text}</p>
                </div>
                <button
                  onClick={() => onRemove(q.id)}
                  aria-label="Remove from saved"
                  className="shrink-0 text-xl text-flamingo-400 transition hover:text-flamingo-600"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
