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
