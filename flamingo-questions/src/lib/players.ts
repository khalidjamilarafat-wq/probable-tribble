export type Players = { g: string; b: string };

const STORAGE_KEY = "flamingo-questions:players";

export function loadPlayers(): Players | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p?.g && p?.b ? { g: p.g, b: p.b } : null;
  } catch {
    return null;
  }
}

export function savePlayers(p: Players) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/** True when a card addresses the players by name. */
export function usesNames(text: string): boolean {
  return text.includes("{G}") || text.includes("{B}");
}

/** Replace {G}/{B} tokens with the players' names. */
export function fillNames(text: string, players: Players | null): string {
  if (!players) return text.replace(/\{G\}/g, "❤️").replace(/\{B\}/g, "💙");
  return text.replace(/\{G\}/g, players.g).replace(/\{B\}/g, players.b);
}
