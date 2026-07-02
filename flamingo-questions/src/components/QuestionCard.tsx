import { Category, Question } from "../data/questions";

type Props = {
  question: Question;
  category: Category;
  index: number;
  total: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onNext: () => void;
  onPrev: () => void;
  onHome: () => void;
};

export default function QuestionCard({
  question,
  category,
  index,
  total,
  isFavorite,
  onToggleFavorite,
  onNext,
  onPrev,
  onHome,
}: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <button onClick={onHome} className="text-sm font-medium text-flamingo-700 hover:underline">
          ← Categories
        </button>
        <span className="text-sm text-gray-500">
          {index + 1} / {total}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-flamingo-100">
        <div
          className="h-full rounded-full bg-flamingo-500 transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <div
        key={question.id}
        className="card-enter flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-flamingo-100 bg-white p-8 text-center shadow-lg shadow-flamingo-200/40"
      >
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${category.color}22`, color: category.color }}
        >
          {category.emoji} {category.label}
        </span>
        <p className="text-2xl font-semibold leading-snug text-gray-800">{question.text}</p>
        <button
          onClick={onToggleFavorite}
          aria-label="Save question"
          className={`text-3xl transition active:scale-90 ${isFavorite ? "" : "opacity-30 grayscale"}`}
        >
          ❤️
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="flex-1 rounded-2xl border border-flamingo-200 bg-white py-3 font-medium text-flamingo-700 transition disabled:opacity-40 hover:enabled:bg-flamingo-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] rounded-2xl bg-flamingo-500 py-3 font-semibold text-white shadow-md shadow-flamingo-500/30 transition hover:bg-flamingo-600 active:scale-[0.98]"
        >
          {index + 1 === total ? "Restart deck" : "Next question"}
        </button>
      </div>
    </div>
  );
}
