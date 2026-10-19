const { test, expect } = require('@playwright/test');
const { openApp, loadFile, tab, sample } = require('./helpers');

test('Hamilton vs Bottas overlay: gap matches the official lap times', async ({ page }) => {
  await openApp(page);
  await loadFile(page, sample('f1-2020-silverstone-fp2-44-hamilton-telemetry.csv'));
  await loadFile(page, sample('f1-2020-silverstone-fp2-77-bottas-telemetry.csv'));
  await tab(page, 'compare'); await page.selectOption('#selA', '0'); await page.selectOption('#selB', '1');
  await expect(page.locator('#ovl')).toContainText('Session A is 0.176 s quicker over these two laps');
  for (const ch of ['v', 'd', 'th', 'b', 'gr', 'rpm']) await expect(page.locator(`#ovl svg[data-xh=${ch}]`)).toHaveCount(1);
});
