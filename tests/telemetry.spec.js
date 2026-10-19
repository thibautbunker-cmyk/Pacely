const { test, expect } = require('@playwright/test');
const { openApp, loadFile, openSamples, pick, tab, sample } = require('./helpers');

test('telemetry page: channels, map, corner table and findings for the sample', async ({ page }) => {
  await openApp(page); await openSamples(page); await pick(page, '9 Telemetry'); await tab(page, 'tele');
  const titles = await page.$$eval('.chan h3', h => h.map(x => x.textContent));
  expect(titles).toEqual(['Speed', 'Time gap', 'Throttle', 'Braking', 'Gear', 'Engine speed', 'Acceleration and braking force', 'Cornering force', 'Steering']);
  await expect(page.locator('#tmap')).toBeVisible();
  await expect(page.locator('.cmp tr')).toHaveCount(7);
  await expect(page.locator('#out')).toContainText('Longest wait for full throttle: T5');
  await expect(page.locator('#out')).toContainText('Early upshifts around T5');
});

test('hovering a chart moves the map marker and fills the readout', async ({ page }) => {
  await openApp(page); await openSamples(page); await pick(page, '9 Telemetry'); await tab(page, 'tele');
  const svg = page.locator('svg[data-xh=v]'); await svg.scrollIntoViewIfNeeded();
  const b = await svg.boundingBox(); await page.mouse.move(b.x + b.width * 0.45, b.y + 80);
  await expect(page.locator('#txr')).toContainText('km/h');
  await expect(page.locator('#mapdot')).toBeVisible();
});

test('real F1 telemetry: estimated cornering force and slow laps labelled', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2020-silverstone-fp2-44-hamilton-telemetry.csv')); await tab(page, 'tele');
  await expect(page.locator('.chan h3', { hasText: 'Cornering force (estimated)' })).toBeVisible();
  const opts = await page.$$eval('#tlap option', o => o.map(x => x.textContent));
  expect(opts.find(t => t.startsWith('Lap 8 '))).toContain('fastest');
  expect(opts.find(t => t.startsWith('Lap 7 '))).toContain('slow lap');
});

test('sessions without telemetry show the empty state', async ({ page }) => {
  await openApp(page); await openSamples(page); await pick(page, '1 Baseline'); await tab(page, 'tele');
  await expect(page.locator('.empty')).toContainText('No telemetry in this session');
});

test('fast corners are found from the shape of the track', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2020-silverstone-fp2-44-hamilton-telemetry.csv'));
  const r = await page.evaluate(() => ({ n: sessions[0].tr.apex.length, note: sessions[0].note }));
  expect(r.n).toBe(14);
  expect(r.note).toContain('6 of them fast corners found from the shape of the track');
});

test('theoretical best lap is close to the fastest lap, also in races', async ({ page }) => {
  await openApp(page);
  for (const f of ['f1-2020-silverstone-fp2-44-hamilton-telemetry.csv', 'f1-2022-bahrain-race-16-leclerc-telemetry.csv',
    'f1-2020-belgium-race-44-hamilton-telemetry.csv', 'f1-2020-italy-race-10-gasly-telemetry.csv', 'f1-2021-saudi-arabia-race-44-hamilton-telemetry.csv'])
    await loadFile(page, sample(f));
  const gaps = await page.evaluate(() => sessions.map(s => { const m = miniBest(s); return m.fast - m.ideal; }));
  expect(gaps[0]).toBeGreaterThan(0.2); expect(gaps[0]).toBeLessThan(0.7);
  for (const g of gaps) { expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThan(1.5); }
  await tab(page, 'tele');
  await expect(page.locator('h2', { hasText: 'Theoretical best lap' })).toBeVisible();
  await expect(page.locator('.mbs i')).not.toHaveCount(0);
});

test('driver sheet: corners to work on against your best through each corner', async ({ page }) => {
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await openApp(page);
  await loadFile(page, sample('f1-2020-silverstone-fp2-44-hamilton-telemetry.csv'));
  await tab(page, 'tele');
  await page.selectOption('#tlap', '11');
  await page.click('#sheetGo');
  await expect(page.locator('.shh h1')).toHaveText('F1 2020 silverstone FP2 44 hamilton telemetry');
  await expect(page.locator('.sc')).toHaveCount(3);
  const lost = await page.$$eval('.scl', e => e.map(x => parseFloat(x.textContent)));
  expect(lost[0]).toBeGreaterThanOrEqual(lost[1]); expect(lost[1]).toBeGreaterThanOrEqual(lost[2]);
  await expect(page.locator('.sc li').first()).not.toBeEmpty();
  await expect(page.locator('.sheet svg circle')).toHaveCount(3);
  await page.selectOption('#tlap', '8');
  await expect(page.locator('.tiles.four')).toContainText('Your fastest lap (this one)');
  await page.click('#sheetBack');
  await expect(page.locator('.chan').first()).toBeVisible();
  expect(errs).toEqual([]);
});
