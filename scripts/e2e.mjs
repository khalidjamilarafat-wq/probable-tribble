// Full user-journey E2E: walks the app as a real user (login → intake → flow →
// scanner → accounting → settings → logout) against `npm run preview` on :4173.
// Usage: npm run build && npm run preview -- --port 4173 & node scripts/e2e.mjs
// Requires playwright-core; set E2E_CHROMIUM to a Chromium binary if needed.
import { chromium } from 'playwright-core';
const SC = process.env.E2E_SHOTS || '.';
const b = await chromium.launch({
  executablePath: process.env.E2E_CHROMIUM || undefined,
  args: ['--no-sandbox'],
});
const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1500, height: 950 } });
const p = await ctx.newPage();
const pageErrors = [];
p.on('pageerror', e => pageErrors.push(e.message.split('\n')[0]));
p.setDefaultTimeout(8000);

const results = [];
const wait = (ms) => p.waitForTimeout(ms);
const T = (txt) => p.getByText(txt, { exact: false }).first();
const relogin = async () => {
  if (await T('Select a user to sign in').isVisible().catch(() => false)) {
    await T('Lab Manager').click(); await wait(250);
    for (const d of ['1','2','3','4']) { await p.locator(`button:has-text("${d}")`).first().click(); await wait(80); }
    await wait(900);
  }
};
const nav = async (label) => {
  await p.locator('.desktop-sidebar .nav-item', { hasText: label }).first().click();
  await wait(600);
};
const step = async (name, fn) => {
  try { await relogin(); await fn(); results.push(['PASS', name]); }
  catch (e) {
    results.push(['FAIL', name + ' :: ' + String(e.message || e).replace(/\n/g, ' | ').slice(0, 230)]);
    // recovery: dismiss any stuck overlay/modal so later steps are unaffected
    try {
      const o = p.locator('.fixed.inset-0');
      const n = await o.count();
      for (let i = n - 1; i >= 0; i--) await o.nth(i).dispatchEvent('click').catch(() => {});
    } catch {}
  }
};
const caseOf = (patient) => p.evaluate((pt) => {
  const s = JSON.parse(localStorage.getItem('dental-state') || '{}');
  return (s.cases || []).find(c => c.patient === pt) || null;
}, patient);

await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await wait(2500);

await step('login via PIN pad works', async () => {
  await relogin();
  if (!await T('Workspace').isVisible()) throw new Error('not in app');
});

// ── DASHBOARD ──
await step('dashboard: notification bell opens panel', async () => {
  await nav('Dashboard');
  await p.locator('.top-bar div.relative > button').first().click(); await wait(400);
  if (!await T('alerts').isVisible()) throw new Error('panel missing');
  await p.locator('.fixed.inset-0').first().dispatchEvent('click'); await wait(300);
});
await step('dashboard: View full flow button navigates', async () => {
  await nav('Dashboard');
  await T('View full flow').click(); await wait(600);
  if (!await T('All Rooms').isVisible()) throw new Error('flow not open');
});
await step('dashboard: All cases button navigates', async () => {
  await nav('Dashboard');
  await T('All cases').click(); await wait(600);
  if (!await p.locator('button:has-text("Add Case")').first().isVisible()) throw new Error('cases not open');
});
await step('dashboard: Add New Case card opens intake', async () => {
  await nav('Dashboard');
  await T('Add New Case').click(); await wait(700);
  if (!await T('New Case Intake').isVisible()) throw new Error('intake not open');
  await p.locator('button:has-text("Cancel")').first().click(); await wait(300);
});

// ── INTAKE: create a real case (modal-scoped inputs) ──
await step('intake: fill complete rush case and save', async () => {
  await nav('Case Management');
  await p.locator('button:has-text("Add Case")').first().click(); await wait(700);
  const M = p.locator('.fixed', { hasText: 'New Case Intake' }).first();
  await M.locator('input.themed').nth(0).fill('Dr. Test');
  await M.locator('input.themed').nth(1).fill('E2E Patient');
  await M.locator('input.themed').nth(3).fill('E2E Clinic');
  await M.locator('button:has-text("BL2")').first().click();
  await M.locator('button:has-text("RUSH")').first().click();
  await M.getByText('E-max', { exact: true }).first().click();
  await M.getByText('Bridge', { exact: true }).first().click();
  for (const n of ['14','15','16']) await M.locator(`button:has-text("${n}")`).first().click();
  await M.locator('button:has-text("Save Case")').click(); await wait(900);
  const c = await caseOf('E2E Patient');
  if (!c) throw new Error('case not saved');
  if (c.priority !== 'rush') throw new Error('priority not rush');
  if (c.shade !== 'BL2') throw new Error('shade=' + c.shade);
  if (c.units !== 3) throw new Error('units=' + c.units);
});
await step('cases: card shows shade + teeth + RUSH badges', async () => {
  await p.locator('input[placeholder*="Search"]').fill('E2E Patient'); await wait(500);
  const card = p.locator('div.glass.rounded-xl', { hasText: 'E2E Patient' }).first();
  if (!await card.getByText('BL2').first().isVisible()) throw new Error('no shade chip');
  if (!await card.getByText('RUSH').first().isVisible()) throw new Error('no rush badge');
  if (!await card.getByText(/14/).first().isVisible()) throw new Error('no teeth chip');
});
await step('cases: status filters + search work', async () => {
  await p.locator('input[placeholder*="Search"]').fill(''); await wait(300);
  await p.locator('button:has-text("Delivered")').first().click(); await wait(400);
  await p.locator('button:has-text("All")').first().click(); await wait(300);
  await p.locator('input[placeholder*="Search"]').fill('E2E'); await wait(400);
  if (!await T('E2E Patient').isVisible()) throw new Error('search failed');
});
await step('cases: QR / case-detail modal opens', async () => {
  const card = p.locator('div.glass.rounded-xl', { hasText: 'E2E Patient' }).first();
  await card.locator('button[title*="QR"], button[title*="Show"]').first().click(); await wait(700);
  if (!await T('Timeline').isVisible()) throw new Error('detail modal missing');
  await p.locator('.fixed.inset-0').first().dispatchEvent('click').catch(() => {});
  await wait(400);
});
await step('cases: remake flow asks reason and stores it', async () => {
  await nav('Case Management');
  await p.locator('input[placeholder*="Search"]').fill('E2E'); await wait(400);
  const card = p.locator('div.glass.rounded-xl', { hasText: 'E2E Patient' }).first();
  await card.locator('button[title="Remake"]').click(); await wait(500);
  if (!await T('Remake Reason').isVisible()) throw new Error('no reason dialog');
  await T('Poor fit').click(); await wait(500);
  const c = await caseOf('E2E Patient');
  if (!c.remake || c.remakeReason !== 'fit') throw new Error('reason not stored');
});
await step('cases: delete then Undo restores', async () => {
  const card = p.locator('div.glass.rounded-xl', { hasText: 'E2E Patient' }).first();
  await card.locator('button').last().click(); await wait(400);
  await T('Undo').click(); await wait(600);
  if (!(await caseOf('E2E Patient'))) throw new Error('undo failed');
  await p.locator('input[placeholder*="Search"]').fill(''); await wait(200);
});

// ── FLOW ──
await step('flow: rush case on board, Move Next advances room', async () => {
  await nav('Production Flow');
  if (!await T('E2E Patient').isVisible()) throw new Error('case not on board');
  const before = (await caseOf('E2E Patient')).currentRoom;
  const card = p.locator('div', { hasText: 'E2E Patient' }).filter({ has: p.locator('button:has-text("Move Next")') }).last();
  await card.locator('button:has-text("Move Next")').first().click(); await wait(800);
  const after = (await caseOf('E2E Patient')).currentRoom;
  if (after === before) throw new Error('room did not change');
});
await step('flow: room filter chips isolate a room', async () => {
  await p.locator('button:has-text("Plaster Room")').first().click(); await wait(500);
  await p.locator('button:has-text("All Rooms")').click(); await wait(300);
});
await step('flow: print labels opens popup sheet', async () => {
  const pop = ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await p.locator('button:has-text("Print Labels")').click();
  const w = await pop;
  if (!w) throw new Error('no popup');
  await w.close();
});

// ── SCANNER ──
await step('scanner: tech sign-in + manual entry advances case', async () => {
  await nav('QR Scanner');
  if (await T('Pick your name').isVisible().catch(() => false)) {
    await T('Hassan Al-Maliki').click(); await wait(700);
  }
  const c1 = await caseOf('E2E Patient');
  await p.locator('input.themed').first().fill(c1.caseId);
  await p.keyboard.press('Enter'); await wait(900);
  const c2 = await caseOf('E2E Patient');
  if (c2.currentRoom === c1.currentRoom) throw new Error('scan did not move case');
});

// ── INVENTORY / TECHNICIANS ──
await step('inventory renders with stock value', async () => {
  await nav('Inventory');
  if (!await T('Stock Value').isVisible()) throw new Error('missing');
});
await step('technicians view renders', async () => {
  await nav('Technicians');
  try {
    await p.waitForFunction(
      () => document.body.innerText.includes('Add Technician') || document.body.innerText.includes('Total Payroll'),
      null, { timeout: 8000 }
    );
  } catch (e) {
    await p.screenshot({ path: SC + '/tech_fail.png', fullPage: true }).catch(() => {});
    throw e;
  }
});

// ── ACCOUNTING ──
await step('accounting: every tab opens without crash', async () => {
  await nav('Accounting');
  for (const tab of ['Invoices', 'Payments', 'Clinics', 'Expenses', 'Reports', 'Settings', 'Dashboard']) {
    await p.locator(`.tab-btn:has-text("${tab}"), button:has-text("${tab}")`).first().click(); await wait(500);
    if (pageErrors.length) throw new Error('crash on tab ' + tab + ': ' + pageErrors[0]);
  }
});
await step('accounting: invoice modal + record payment (the fixed crash)', async () => {
  await p.locator('button:has-text("Invoices")').first().click(); await wait(500);
  await p.getByText(/INV-\d+/).first().click(); await wait(800);
  if (!await T('Grand Total').isVisible()) throw new Error('invoice modal missing');
  const payBtn = p.locator('button:has-text("Record Payment")').first();
  if (await payBtn.isVisible().catch(() => false)) {
    await payBtn.click(); await wait(600);
    if (pageErrors.length) throw new Error('payment modal crashed: ' + pageErrors[0]);
    await p.locator('.fixed button:has-text("Record Payment")').last().click().catch(() => {});
    await wait(500);
  }
  await p.locator('.fixed.inset-0').first().dispatchEvent('click').catch(() => {});
  await wait(400);
});
await step('accounting: add expense saves and lists', async () => {
  // dismiss any modal left open by a previous step
  const ov = p.locator('.fixed.inset-0');
  for (let i = (await ov.count()) - 1; i >= 0; i--) await ov.nth(i).dispatchEvent('click').catch(() => {});
  await wait(300);
  await nav('Accounting');
  await p.locator('button:has-text("Expenses")').first().click(); await wait(400);
  await p.locator('button:has-text("Add Expense")').first().click(); await wait(600);
  const M = p.locator('.fixed', { hasText: 'Add Expense' }).last();
  await M.locator('input.themed').nth(0).fill('E2E Expense');
  await M.locator('input.themed').nth(1).fill('25');
  await M.locator('button:has-text("Save")').first().click(); await wait(600);
  if (!await T('E2E Expense').isVisible()) throw new Error('expense not listed');
});

// ── ANALYTICS / AI / DISPLAY ──
await step('analytics renders incl. remake-reasons breakdown', async () => {
  await nav('Analytics');
  await wait(700);
  if (!await T('Remake Analysis').isVisible()) throw new Error('missing analytics');
  if (!await T('Remake reasons').isVisible()) throw new Error('missing reasons');
});
await step('ai assistant replies via local fallback', async () => {
  await nav('AI Assistant');
  await p.locator('textarea.themed').fill('overdue cases');
  await p.keyboard.press('Enter'); await wait(1800);
  const n = await p.getByText(/overdue|No overdue/i).count();
  if (n < 2) throw new Error('no reply');
});
await step('display board renders live', async () => {
  await nav('Display');
  await wait(900);
  if (!await T('Live Board').isVisible()) throw new Error('missing board');
});

// ── SETTINGS ──
await step('settings: add user works', async () => {
  await nav('Settings');
  await p.locator('button:has-text("Add user")').click(); await wait(400);
  if (!await p.locator('input[value="New User"]').first().isVisible()) throw new Error('user not added');
});
await step('settings: cloud connect fails gracefully (offline)', async () => {
  await p.locator('input[placeholder="evora-lab-01"]').fill('e2e-lab');
  await p.locator('input[type="password"]').first().fill('1234');
  await p.locator('button:has-text("Create / Connect")').click(); await wait(1500);
  if (pageErrors.length) throw new Error('cloud connect crashed: ' + pageErrors[0]);
});
await step('settings: JSON + CSV export download', async () => {
  const d1 = p.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  await p.locator('button:has-text("JSON")').first().click();
  if (!await d1) throw new Error('no JSON download');
  const d2 = p.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  await p.locator('button:has-text("CSV")').first().click();
  if (!await d2) throw new Error('no CSV download');
});
await step('language toggles to Arabic and back', async () => {
  await p.locator('button:has-text("العربية")').click(); await wait(900);
  if (!await T('الإعدادات العامة').isVisible()) throw new Error('arabic missing');
  await p.locator('button:has-text("English")').click(); await wait(700);
});
await step('logout returns to lock screen', async () => {
  await p.locator('button[title="Log out"]').click(); await wait(700);
  if (!await T('Select a user to sign in').isVisible()) throw new Error('no lock');
});

await p.screenshot({ path: SC + '/e2e_final.png' });
await b.close();
const fails = results.filter(r => r[0] === 'FAIL');
console.log(`\n===== E2E v2: ${results.length - fails.length}/${results.length} PASS =====`);
for (const [s, n] of results) console.log(`${s === 'PASS' ? '✓' : '✗'} ${n}`);
console.log('\npageErrors:', pageErrors.length ? pageErrors.slice(0, 8) : 'NONE');
