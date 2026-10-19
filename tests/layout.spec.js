const { test, expect } = require('@playwright/test');
const { openApp, openSamples, pick, tab } = require('./helpers');

for (const t of ['call', 'quali', 'tele', 'compare', 'files']) {
  test(`no sideways scrolling at phone width on the ${t} tab`, async ({ page }) => {
    await openApp(page, { width: 390 }); await openSamples(page); await pick(page, t === 'quali' ? '7 Qualifying' : '9 Telemetry'); await tab(page, t);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect(page.errors).toEqual([]);
  });
}

test('dark theme renders without errors', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await openApp(page); await openSamples(page); await tab(page, 'tele');
  expect(page.errors).toEqual([]);
});
