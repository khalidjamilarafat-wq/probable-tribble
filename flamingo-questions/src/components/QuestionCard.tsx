import { useRef, useState } from "react";
import { Category, Question } from "../data/questions";
import { Players, fillNames } from "../lib/players";

type Props = {
  question: Question;
  category: Category;
  index: number;
  total: number;
  isFavorite: boolean;
  players: Players | null;
  onToggleFavorite: () => void;
  onNext: () => void;
  onPrev: () => void;
  onHome: () => void;
};

const SWIPE_THRESHOLD = 80;

export default function QuestionCard({
  question,
  category,
  index,
  total,
  isFavorite,
  players,
  onToggleFavorite,
  onNext,
  onPrev,
  onHome,
}: Props) {
  const startX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const [showArabic, setShowArabic] = useState(false);

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    setDragX(e.clientX - startX.current);
  }

  function advance(dir: "left" | "right", action: () => void) {
    setLeaving(dir);
    setTimeout(() => {
      setLeaving(null);
      setDragX(0);
      setShowArabic(false);
      action();
    }, 160);
  }

  function finishDrag() {
    if (startX.current === null) return;
    const dx = dragX;
    startX.current = null;
    if (dx <= -SWIPE_THRESHOLD) {
      advance("left", onNext);
    } else if (dx >= SWIPE_THRESHOLD && index > 0) {
      advance("right", onPrev);
    } else {
      setDragX(0);
    }
  }

  const dragging = startX.current !== null;
  const offset = leaving === "left" ? -480 : leaving === "right" ? 480 : dragX;
  const style: React.CSSProperties = {
    transform: `translateX(${offset}px) rotate(${offset / 40}deg)`,
    opacity: leaving ? 0 : 1 - Math.min(Math.abs(dragX) / 400, 0.4),
    transition: dragging ? "none" : "transform 0.16s ease-out, opacity 0.16s ease-out",
    touchAction: "pan-y",
  };

  const text = fillNames(question.text, players);
  const arabic = question.ar ? fillNames(question.ar, players) : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 overflow-hidden px-4 py-8">
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
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        className="card-enter flex flex-1 cursor-grab select-none flex-col items-center justify-center gap-5 rounded-3xl border border-flamingo-100 bg-white p-8 text-center shadow-lg shadow-flamingo-200/40 active:cursor-grabbing"
      >
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${category.color}22`, color: category.color }}
        >
          {category.emoji} {category.label}
        </span>
        <p className="text-2xl font-semibold leading-snug text-gray-800">{text}</p>
        {arabic && showArabic && (
          <p dir="rtl" className="rounded-2xl bg-flamingo-50 px-4 py-3 text-lg font-medium leading-relaxed text-flamingo-900">
            {arabic}
          </p>
        )}
        <div className="flex items-center gap-4">
          {arabic && (
            <button
              onClick={() => setShowArabic((v) => !v)}
              aria-label="Translate"
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition active:scale-95 ${
                showArabic
                  ? "border-flamingo-400 bg-flamingo-500 text-white"
                  : "border-flamingo-200 bg-white text-flamingo-600 hover:bg-flamingo-50"
              }`}
            >
              🌐 {showArabic ? "English" : "عربي"}
            </button>
          )}
          <button
            onClick={onToggleFavorite}
            aria-label="Save question"
            className={`text-3xl transition active:scale-90 ${isFavorite ? "" : "opacity-30 grayscale"}`}
          >
            ❤️
          </button>
        </div>
        <span className="text-xs text-gray-400">Swipe left for next · right for previous</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => (index > 0 ? advance("right", onPrev) : undefined)}
          disabled={index === 0}
          className="flex-1 rounded-2xl border border-flamingo-200 bg-white py-3 font-medium text-flamingo-700 transition disabled:opacity-40 hover:enabled:bg-flamingo-50"
        >
          Back
        </button>
        <button
          onClick={() => advance("left", onNext)}
          className="flex-[2] rounded-2xl bg-flamingo-500 py-3 font-semibold text-white shadow-md shadow-flamingo-500/30 transition hover:bg-flamingo-600 active:scale-[0.98]"
        >
          {index + 1 === total ? "Restart deck" : "Next question"}
        </button>
      </div>
    </div>
  );
}
