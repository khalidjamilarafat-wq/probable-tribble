// Invariants over the demo seed data — these double as a contract for the
// case/inventory shape the whole app relies on. If a refactor breaks the
// data model, these fail before any user sees it.
import { describe, it, expect } from 'vitest';
import {
  seedCases, seedInventory, seedUsers, defaultState,
  ROOMS, ROOM_SLA_HOURS, ROLE_VIEWS, REMAKE_REASONS, SHADE_OPTIONS,
  nextRoomId, prevRoomId,
} from '../LabApp';

const ROOM_IDS = ROOMS.map((r: any) => r.id);
const VALID_STATUSES = ['pending', 'inProgress', 'completed', 'delivered'];
// FDI two-digit tooth notation: quadrants 1-4 (permanent), positions 1-8.
const isFdiTooth = (n: number) => {
  const q = Math.floor(n / 10), p = n % 10;
  return q >= 1 && q <= 4 && p >= 1 && p <= 8;
};

describe('room pipeline', () => {
  it('has the 7 rooms in workflow order, reception first, office last', () => {
    expect(ROOM_IDS[0]).toBe('reception');
    expect(ROOM_IDS[ROOM_IDS.length - 1]).toBe('office');
    expect(ROOM_IDS).toHaveLength(7);
  });
  it('nextRoomId/prevRoomId walk the pipeline and stop at the ends', () => {
    expect(nextRoomId('reception')).toBe(ROOM_IDS[1]);
    expect(nextRoomId('office')).toBeNull();
    expect(prevRoomId('reception')).toBeNull();
    expect(prevRoomId(ROOM_IDS[1])).toBe('reception');
  });
  it('every room has an SLA', () => {
    ROOM_IDS.forEach((id: string) => expect(ROOM_SLA_HOURS[id]).toBeGreaterThan(0));
  });
});

describe('seedCases', () => {
  const cases = seedCases();

  it('generates exactly 50 cases with unique ids and caseIds', () => {
    expect(cases).toHaveLength(50);
    expect(new Set(cases.map((c: any) => c.id)).size).toBe(50);
    expect(new Set(cases.map((c: any) => c.caseId)).size).toBe(50);
  });

  it('every case has a valid room, status, shade, and positive units/price', () => {
    for (const c of cases) {
      expect(ROOM_IDS).toContain(c.currentRoom);
      expect(VALID_STATUSES).toContain(c.status);
      expect(SHADE_OPTIONS.concat(['A3.5'])).toContain(c.shade);
      expect(c.units).toBeGreaterThan(0);
      expect(c.price).toBeGreaterThan(0);
      expect(c.caseId).toMatch(/^C-\d{4}-\d{3}$/);
      expect(c.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('teeth are valid FDI numbers', () => {
    for (const c of cases) {
      expect(Array.isArray(c.teeth)).toBe(true);
      c.teeth.forEach((n: number) => expect(isFdiTooth(n), `tooth ${n}`).toBe(true));
    }
  });

  it('room history follows the pipeline order and ends at the current room', () => {
    for (const c of cases) {
      const path = c.roomHistory.map((h: any) => h.room);
      // History must be a prefix of the pipeline (no skipped/reordered rooms).
      path.forEach((room: string, i: number) => expect(room).toBe(ROOM_IDS[i]));
      expect(path[path.length - 1]).toBe(c.currentRoom);
      // Timestamps must be non-decreasing.
      const times = c.roomHistory.map((h: any) => new Date(h.at).getTime());
      for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
    }
  });

  it('delivered cases are in the office; active cases are not delivered', () => {
    for (const c of cases) {
      if (c.status === 'delivered') expect(c.currentRoom).toBe('office');
      if (c.currentRoom !== 'office') expect(['pending', 'inProgress']).toContain(c.status);
    }
  });

  it('every remake carries a known reason; non-remakes carry none', () => {
    const reasonIds = REMAKE_REASONS.map((r: any) => r.id);
    for (const c of cases) {
      if (c.remake) expect(reasonIds).toContain(c.remakeReason);
      else expect(c.remakeReason).toBeNull();
    }
    expect(cases.some((c: any) => c.remake)).toBe(true);
  });

  it('includes rush cases and implant cases with implant data', () => {
    expect(cases.some((c: any) => c.priority === 'rush')).toBe(true);
    const implants = cases.filter((c: any) => c.type === 'implant');
    expect(implants.length).toBeGreaterThan(0);
    implants.forEach((c: any) => {
      expect(c.isImplant).toBe(true);
      expect(c.implantData).toBeTruthy();
    });
  });

  it('spreads over roughly three months of intake dates', () => {
    const days = cases.map((c: any) => (Date.now() - new Date(c.date).getTime()) / 86400000);
    expect(Math.max(...days)).toBeGreaterThan(70);
    expect(Math.min(...days)).toBeLessThan(7);
  });
});

describe('seedInventory', () => {
  const inv = seedInventory();
  it('stocks a full opening inventory with valid fields', () => {
    expect(inv.length).toBeGreaterThanOrEqual(25);
    for (const it_ of inv) {
      expect(it_.name_en).toBeTruthy();
      expect(it_.stock).toBeGreaterThanOrEqual(0);
      expect(it_.reorderAt).toBeGreaterThan(0);
      expect(it_.unitPrice).toBeGreaterThan(0);
      expect(it_.supplier).toBeTruthy();
      expect(it_.category).toBeTruthy();
    }
  });
  it('keeps a few items low to exercise the low-stock alerts', () => {
    const low = inv.filter((i: any) => i.stock <= i.reorderAt);
    expect(low.length).toBeGreaterThanOrEqual(2);
    expect(low.length).toBeLessThanOrEqual(6);
  });
});

describe('users & roles', () => {
  it('seeds one user per role with numeric PINs', () => {
    const users = seedUsers();
    const roles = users.map((u: any) => u.role);
    ['manager', 'reception', 'technician', 'accountant'].forEach(r => expect(roles).toContain(r));
    users.forEach((u: any) => expect(u.pin).toMatch(/^\d{4,}$/));
  });
  it('role views only reference views the manager also has (manager sees all)', () => {
    const all = new Set(ROLE_VIEWS.manager);
    for (const role of Object.keys(ROLE_VIEWS)) {
      ROLE_VIEWS[role].forEach((v: string) => expect(all.has(v), `${role}:${v}`).toBe(true));
    }
  });
});

describe('defaultState', () => {
  it('assembles a complete initial state', () => {
    const s = defaultState();
    expect(s.cases).toHaveLength(50);
    expect(s.inventory.length).toBeGreaterThanOrEqual(25);
    expect(s.users.length).toBeGreaterThanOrEqual(4);
    expect(s.cloud).toEqual({ labId: '', pin: '', enabled: false });
    expect(Array.isArray(s.audit)).toBe(true);
    expect(s.currencies.length).toBeGreaterThan(0);
    expect(s.technicians.length).toBeGreaterThan(0);
  });
});
