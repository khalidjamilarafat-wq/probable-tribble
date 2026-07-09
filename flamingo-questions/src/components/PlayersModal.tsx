import { useState } from "react";
import { Players } from "../lib/players";

type Props = {
  initial: Players | null;
  onSave: (players: Players) => void;
  onCancel: () => void;
};

export default function PlayersModal({ initial, onSave, onCancel }: Props) {
  const [g, setG] = useState(initial?.g ?? "");
  const [b, setB] = useState(initial?.b ?? "");
  const valid = g.trim().length > 0 && b.trim().length > 0;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="text-3xl">👩‍❤️‍👨</div>
        <h3 className="mt-2 text-lg font-bold text-gray-800">Who's playing?</h3>
        <p className="mt-1 text-sm text-gray-500">
          Dare cards call each of you by name.
        </p>
        <div className="mt-4 flex flex-col gap-3 text-left">
          <label className="text-sm font-medium text-gray-700">
            Her name 💗
            <input
              value={g}
              onChange={(e) => setG(e.target.value)}
              placeholder="e.g. Sara"
              className="mt-1 w-full rounded-xl border border-flamingo-200 px-3 py-2.5 outline-none focus:border-flamingo-400 focus:ring-2 focus:ring-flamingo-100"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            His name 💙
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="e.g. Khalid"
              className="mt-1 w-full rounded-xl border border-flamingo-200 px-3 py-2.5 outline-none focus:border-flamingo-400 focus:ring-2 focus:ring-flamingo-100"
            />
          </label>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => valid && onSave({ g: g.trim(), b: b.trim() })}
            disabled={!valid}
            className="w-full rounded-xl bg-flamingo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-flamingo-600 disabled:opacity-40"
          >
            Let's play
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
