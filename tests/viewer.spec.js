const { test, expect } = require('@playwright/test');
const { openApp, openSamples, pick, tab } = require('./helpers');

test('CSV download goes through the viewer and includes sectors', async ({ page }) => {
  await openApp(page, { viewer: true }); await openSamples(page); await pick(page, '7 Qualifying'); await tab(page, 'files');
  await page.click('#dl');
  await page.waitForFunction(() => window.__saves.length === 1);
  const s = await page.evaluate(() => window.__saves[0]);
  expect(s.filename).toBe('7-Qualifying-with-sectors.csv');
  expect(s.data.split('\n')[0]).toBe('lap,lap_time,s1,s2,s3');
});

for (const t of ['call', 'quali', 'tele']) {
  test(`Save as PDF on the ${t} tab makes a PDF in the viewer`, async ({ page }) => {
    await openApp(page, { viewer: true }); await openSamples(page);
    await pick(page, t === 'quali' ? '7 Qualifying' : t === 'tele' ? '8 Telemetry' : '1 Baseline'); await tab(page, t);
    await page.click('#print');
    await page.waitForFunction(() => window.__saves.length === 1, null, { timeout: 60_000 });
    const s = await page.evaluate(() => window.__saves[0]);
    expect(s.filename).toMatch(/\.pdf$/);
    expect(s.data.startsWith('%PDF')).toBe(true);
    expect(await page.evaluate(() => printing)).toBe(false);
  });
}

for (const [t, name, key] of [['call', '1 Baseline', 'raceCall'], ['quali', '7 Qualifying', 'sectors'], ['tele', '9 Telemetry', 'corners']]) {
  test(`AI engineer on the ${t} tab sends that tab's facts`, async ({ page }) => {
    await openApp(page, { viewer: true }); await openSamples(page); await pick(page, name); await tab(page, t);
    await page.click('#aiExplain');
    await expect(page.locator('#aiLog')).toContainText('Test answer 1');
    const sent = await page.evaluate(() => window.__asked[0]);
    expect(sent).toContain(`"${key}"`);
    expect(sent).toContain('Answer using ONLY');
  });
}
