const { test, expect } = require('@playwright/test');
const { openApp, loadFile, openSamples, pick, tab, sample } = require('./helpers');

test('sample qualifying session: ideal lap, sector table and findings', async ({ page }) => {
  await openApp(page); await openSamples(page); await pick(page, '7 Qualifying'); await tab(page, 'quali');
  await expect(page.locator('.tiles')).toContainText('1:31.342');
  await expect(page.locator('#out')).toContainText('Sector 2 is where push laps lose the most');
  await expect(page.locator('table.cmp').first()).toContainText('37.960');
});

test('real F1 qualifying: ideal laps and ranking', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2024-spain-qualifying.csv'));
  const r = await page.evaluate(() => Object.fromEntries(sessions.map(s => { const q = qAnalyse(s); return [s.name.split(' ')[1], +(q.sec.gap).toFixed(3)]; })));
  expect(r.NOR).toBe(0);
  expect(r.SAI).toBeCloseTo(0.088, 3);
  expect(r.RUS).toBeCloseTo(0.080, 3);
  await pick(page, 'NOR'); await tab(page, 'quali');
  await expect(page.locator('.verdict')).toContainText('Fastest of 20 loaded sessions');
});
