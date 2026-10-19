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
