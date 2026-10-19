const { test, expect } = require('@playwright/test');
const { openApp, loadFile, fixture, sample } = require('./helpers');

test('Excel workbook: skips text and hidden sheets, reads time-formatted lap times and sectors', async ({ page }) => {
  await openApp(page);
  await loadFile(page, fixture('timing.xlsx'));
  const s = await page.evaluate(() => { const s = sessions[0], q = qAnalyse(s); return { n: sessions.length, name: s.name, laps: s.laps.length, best: q.best, ideal: q.sec.ideal }; });
  expect(s).toMatchObject({ n: 1, name: 'timing – Laps', laps: 10 });
  expect(s.best).toBeCloseTo(91.297, 3);
  expect(s.ideal).toBeCloseTo(91.240, 3);
});

test('Excel file renamed to .csv still loads as a workbook', async ({ page }) => {
  await openApp(page);
  await loadFile(page, fixture('xlsx-renamed.csv'));
  expect(await page.evaluate(() => sessions[0].laps.length)).toBe(10);
});

test('old .xls files get a conversion message', async ({ page }) => {
  await openApp(page);
  await page.setInputFiles('#file', fixture('timing.xls'));
  await expect(page.locator('#out .notice.bad')).toContainText('old Excel file (.xls)');
  expect(await page.evaluate(() => sessions.length)).toBe(0);
});

for (const f of ['alkamel.csv', 'alkamel.xlsx']) {
  test(`multi-car timing sheet (${f}) splits into cars with sectors`, async ({ page }) => {
    await openApp(page);
    await loadFile(page, fixture(f));
    const r = await page.evaluate(() => sessions.map(s => { const q = qAnalyse(s); return [s.name, +q.best.toFixed(3), +q.sec.ideal.toFixed(3)]; }));
    expect(r).toEqual([['#7 Team 7 (HYPERCAR)', 90.45, 90.174], ['#51 Team 51 (HYPERCAR)', 91.06, 90.867]]);
  });
}

test('sector times alone build the lap time', async ({ page }) => {
  await openApp(page);
  await loadFile(page, fixture('sectorsonly.csv'));
  const r = await page.evaluate(() => sessions[0].laps.map(l => +(l.t - l.s.reduce((a, b) => a + b, 0)).toFixed(6)));
  expect(r).toHaveLength(8);
  expect(r.every(d => d === 0)).toBe(true);
});

test('sectors that do not add up to the lap time are ignored with a note', async ({ page }) => {
  await openApp(page);
  await loadFile(page, fixture('mismatch.csv'));
  const s = await page.evaluate(() => ({ withSectors: sessions[0].laps.filter(l => l.s).length, note: sessions[0].note }));
  expect(s.withSectors).toBe(0);
  expect(s.note).toContain('do not add up');
});

test('real F1 qualifying: 20 cars with driver names, pole matches the real result', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2024-spain-qualifying.csv'));
  const r = await page.evaluate(() => { const rows = sessions.map(s => [s.name, qAnalyse(s).best]).sort((a, b) => a[1] - b[1]); return { n: sessions.length, top: rows.slice(0, 2).map(x => [x[0], +x[1].toFixed(3)]) }; });
  expect(r.n).toBe(20);
  expect(r.top).toEqual([['#4 NOR McLaren', 71.383], ['#1 VER Red Bull Racing', 71.403]]);
});

test('real F1 telemetry with GPS-free X/Y position: lap times match the official ones, map is built', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2020-silverstone-fp2-44-hamilton-telemetry.csv'));
  const r = await page.evaluate(() => { const s = sessions[0], t = Object.fromEntries(s.laps.map(l => [l.lap, +l.t.toFixed(3)])); return { lap2: t[2], lap5: t[5], lap8: t[8], map: !!s.tr.map, ch: s.tr.ch }; });
  expect(r).toMatchObject({ lap2: 85.911, lap5: 86.273, lap8: 85.606, map: true, ch: { th: true, b: true, gr: true, rpm: true, g: false } });
});

test('sessions are grouped by event: picker, quali ranking and removing an event', async ({ page }) => {
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await openApp(page);
  await loadFile(page, sample('f1-2024-spain-qualifying.csv'));
  await loadFile(page, sample('f1-2023-azerbaijan-qualifying.csv'));
  await loadFile(page, sample('f1-2020-silverstone-fp2-44-hamilton-telemetry.csv'));
  const ev = await page.evaluate(() => evGroups().map(g => [g.label, g.items.length]));
  expect(ev).toEqual([['F1 2024 spain qualifying', 20], ['F1 2023 azerbaijan qualifying', 18], ['F1 2020 silverstone FP2 44 hamilton telemetry', 1]]);
  expect(await page.evaluate(() => sessions[sessions.length - 1].name)).toBe('F1 2020 silverstone FP2 44 hamilton telemetry');
  await expect(page.locator('#selS optgroup')).toHaveCount(3);
  await page.evaluate(() => { cur = sessions.findIndex(s => s.name.includes('NOR')); render(); });
  await page.click('[data-tab=quali]');
  const ranked = page.locator('h2:has-text("Sessions ranked") + .card tr');
  await expect(ranked).toHaveCount(21);
  await page.click('[data-qscope=all]');
  await expect(ranked).toHaveCount(40);
  await page.click('[data-tab=files]');
  await expect(page.locator('.evg')).toHaveCount(3);
  await page.click('[data-rmev="1"]'); await page.click('[data-rmev="1"]');
  await expect(page.locator('.evg')).toHaveCount(2);
  expect(await page.evaluate(() => [sessions.length, sessions[cur].name])).toEqual([21, '#4 NOR McLaren']);
  expect(errs).toEqual([]);
});
