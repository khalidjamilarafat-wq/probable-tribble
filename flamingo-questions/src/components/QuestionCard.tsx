import { useRef, useState } from "react";
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

const SWIPE_THRESHOLD = 80;

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
  const startX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    setDragX(e.clientX - startX.current);
  }

  function finishDrag() {
    if (startX.current === null) return;
    const dx = dragX;
    startX.current = null;
    if (dx <= -SWIPE_THRESHOLD) {
      // swipe left → next card
      setLeaving("left");
      setTimeout(() => {
        setLeaving(null);
        setDragX(0);
        onNext();
      }, 160);
    } else if (dx >= SWIPE_THRESHOLD && index > 0) {
      // swipe right → previous card
      setLeaving("right");
      setTimeout(() => {
        setLeaving(null);
        setDragX(0);
        onPrev();
      }, 160);
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
        className="card-enter flex flex-1 cursor-grab select-none flex-col items-center justify-center gap-6 rounded-3xl border border-flamingo-100 bg-white p-8 text-center shadow-lg shadow-flamingo-200/40 active:cursor-grabbing"
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
        <span className="text-xs text-gray-400">⇠ اسحب للسؤال التالي · اسحب للسابق ⇢</span>
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
