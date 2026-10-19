const { test, expect } = require('@playwright/test');
const { openApp, loadFile, openSamples, pick, tab, sample } = require('./helpers');

const head = page => page.evaluate(() => call(analyse(sessions[cur])).head);
const setToGo = (page, v) => page.evaluate(v => { sessions[cur].meta.remaining = v; }, v);

test('sample race calls', async ({ page }) => {
  await openApp(page); await openSamples(page);
  const r = await page.evaluate(() => Object.fromEntries(sessions.slice(0, 6).map(s => [s.name, call(analyse(s)).head])));
  expect(r).toEqual({
    '1 Baseline setup': 'About 9 laps of tyre life left',
    '2 Softer front springs': 'Plan your stop in the next 6 laps',
    '3 Fresh tyres, low wear': 'About 19 laps of tyre life left',
    '4 Driver error session': 'Plan your stop in the next 7 laps',
    '5 Hot day, heavy wear': 'A stop would already pay for itself',
    '6 Race with pit stop': 'A stop would already pay for itself',
  });
});

test('laps to go: blank, finished, and laps remaining', async ({ page }) => {
  await openApp(page); await openSamples(page); await pick(page, '5 Hot day');
  await setToGo(page, ''); expect(await head(page)).toBe('A stop would already pay for itself');
  await setToGo(page, '0'); expect(await head(page)).toBe('Race finished on these tyres');
  await setToGo(page, '10'); expect(await head(page)).toBe('Pit as soon as you can');
  await pick(page, '3 Fresh'); await setToGo(page, '10'); expect(await head(page)).toBe('Tyres should last to the flag');
});

test('finished race view: best stint tile, no pit window, no act-now tyre findings', async ({ page }) => {
  await openApp(page); await openSamples(page); await pick(page, '5 Hot day'); await tab(page, 'call');
  await page.fill('#rem', '0'); await page.press('#rem', 'Tab');
  await expect(page.locator('.call .big')).toHaveText(/Race finished on these tyres/i);
  await expect(page.locator('.tiles')).toContainText('Best stint on this set');
  await expect(page.locator('.band')).toHaveCount(0);
  expect(await page.evaluate(() => analyse(sessions[cur]).F.filter(f => f.sev === 'high').length)).toBe(0);
});

test('real F1 race: pit stops found from the telemetry split the stints', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2022-bahrain-race-16-leclerc-telemetry.csv'));
  const r = await page.evaluate(() => { const s = sessions[0], run = runLaps(s); return { pits: s.laps.filter(l => l.pit).map(l => l.lap), stints: run.stints.map(t => t.first + '-' + t.last) }; });
  expect(r.pits).toEqual([16, 32, 47]);
  expect(r.stints).toEqual(['1-15', '18-31', '34-46', '52-57']);
});

test('real F1 race: F1 fuel rate is chosen automatically and braking points are skipped on sparse data', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2020-belgium-race-44-hamilton-telemetry.csv'));
  const r = await page.evaluate(() => { const a = analyse(sessions[0]); return { fuel: a.fuel, src: a.fuelSrc, note: sessions[0].note, brakePoints: sessions[0].cr.filter(c => c.b != null).length }; });
  expect(r.fuel).toBe(0.06);
  expect(r.src).toContain('Formula 1 rate');
  expect(r.brakePoints).toBe(0);
  expect(r.note).toContain('Braking points are not measured');
});

test('tyre compounds: stints split at tyre changes and compared by compound', async ({ page }) => {
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await openApp(page);
  await loadFile(page, sample('f1-2022-bahrain-race-timing.csv'));
  expect(await page.evaluate(() => sessions.length)).toBe(20);
  await pick(page, 'Leclerc'); await tab(page, 'call');
  const st = await page.evaluate(() => runLaps(sessions[cur]).stints.map(t => [t.first, t.last, t.c, t.age0]));
  expect(st).toEqual([[1, 14, 'Soft', 0], [17, 30, 'Soft', 3], [33, 44, 'Medium', 0], [52, 57, 'Soft', 5]]);
  const card = page.locator('h2:has-text("Stints and tyres") + .card');
  await expect(card.locator('tr')).toHaveCount(5);
  await expect(card).toContainText('used, 3 laps old');
  await expect(card).toContainText('Tyre loss per lap: Soft');
  await expect(page.locator('.chip[data-st="2"]')).toContainText('Medium');
  await tab(page, 'quali');
  await expect(page.locator('h2:has-text("Runs") + .card th', { hasText: 'Tyres' })).toBeVisible();
  expect(errs).toEqual([]);
});

test('tyre compounds in qualifying files label each run', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2024-spain-qualifying.csv'));
  await pick(page, 'NOR'); await tab(page, 'quali');
  const runs = page.locator('h2:has-text("Runs") + .card');
  await expect(runs).toContainText('Soft');
});

test('race picture: positions, gaps, pit rejoin and undercuts from a multi-car timing file', async ({ page }) => {
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await openApp(page);
  await loadFile(page, sample('f1-2022-bahrain-race-timing.csv'));
  await pick(page, 'Leclerc'); await tab(page, 'call');
  const card = page.locator('h2:has-text("Race picture") + .card');
  await expect(card).toContainText('P1');
  await page.fill('#asof', '30'); await page.locator('#asof').dispatchEvent('change');
  await expect(card).toContainText('Position after lap 30');
  await expect(card).toContainText('Ahead of Max Verstappen');
  await expect(card).toContainText('If you pit on lap 30, you rejoin about P4');
  await expect(card).toContainText('measured from');
  const rows = card.locator('table tr', { hasText: 'Max Verstappen' });
  await expect(rows.first()).toContainText('Lap 14 (earlier)');
  await expect(rows.first()).toContainText('Lost 2.9 s');
  const f = await page.evaluate(() => racePicFacts(sessions[cur], analyse(sessions[cur])));
  expect(f.position).toBe(1); expect(f.carBehind).toBe('Max Verstappen'); expect(f.gapBehindS).toBeCloseTo(6.4, 1);
  expect(f.pitStopLossS).toBeGreaterThan(18); expect(f.pitStopLossS).toBeLessThan(30);
  await pick(page, 'Verstappen');
  await page.fill('#asof', '30'); await page.locator('#asof').dispatchEvent('change');
  await expect(page.locator('h2:has-text("Race picture") + .card')).toContainText('Behind Charles Leclerc');
  expect(errs).toEqual([]);
});

test('single-car files show no race picture', async ({ page }) => {
  await openApp(page); await openSamples(page); await pick(page, '6 Race'); await tab(page, 'call');
  await expect(page.locator('h2', { hasText: 'Race picture' })).toHaveCount(0);
});
