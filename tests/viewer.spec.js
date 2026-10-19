const { test, expect } = require('@playwright/test');
const { openApp, openSamples, pick, tab, loadFile, sample } = require('./helpers');

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

test('driver sheet saves as a one-page PDF', async ({ page }) => {
  await openApp(page, { viewer: true });
  await loadFile(page, sample('f1-2020-silverstone-fp2-44-hamilton-telemetry.csv'));
  await tab(page, 'tele'); await page.selectOption('#tlap', '11'); await page.click('#sheetGo');
  await page.click('#print');
  await page.waitForFunction(() => window.__saves.length === 1, null, { timeout: 60_000 });
  const s = await page.evaluate(() => window.__saves[0]);
  expect(s.filename).toMatch(/^Pacely driver sheet .*\.pdf$/);
  expect((s.data.match(/\/Type \/Page[^s]/g) || []).length).toBe(1);
});

test('team sessions: share a telemetry session and an event, then open them on a fresh device', async ({ page }) => {
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await openApp(page, { viewer: true, team: true });
  await loadFile(page, sample('f1-2020-silverstone-fp2-44-hamilton-telemetry.csv'));
  await tab(page, 'files');
  await page.click('#tshare');
  await expect(page.locator('.tmr')).toHaveCount(1);
  await expect(page.locator('.tmr')).toContainText('shared by you');
  const chunks = await page.evaluate(() => [...window.__team.store.keys()].filter(k => k.includes('/tr/')).length);
  expect(chunks).toBeGreaterThan(1);
  await loadFile(page, sample('f1-2022-bahrain-race-timing.csv'));
  await tab(page, 'files');
  await page.click('#tshareEv');
  await expect(page.locator('.tmr')).toHaveCount(21);
  // a teammate's empty browser: no local sessions, the team list is on the start page
  await page.evaluate(() => indexedDB.deleteDatabase('pacely'));
  await page.reload();
  await expect(page.locator('.tmr')).toHaveCount(21);
  const row = page.locator('.tmr', { hasText: 'hamilton telemetry' });
  await row.locator('[data-topen]').click();
  await expect(page.locator('.chan').first()).toBeVisible();
  const same = await page.evaluate(() => { const T = sessions[0].tr; return [T.nb, Object.keys(T.laps).length, T.apex.length]; });
  expect(same[0]).toBeGreaterThan(1000); expect(same[1]).toBeGreaterThan(10); expect(same[2]).toBe(14);
  await tab(page, 'files');
  await page.locator('.tmr', { hasText: 'Charles Leclerc' }).locator('[data-topen]').click();
  await expect(page.locator('h2:has-text("Race picture")')).toHaveCount(0);
  await tab(page, 'files');
  const rm = page.locator('.tmr', { hasText: 'Carlos Sainz' }).locator('[data-trm]');
  await rm.click(); await rm.click();
  await expect(page.locator('.tmr')).toHaveCount(20);
  expect(errs).toEqual([]);
});

test('without the shared store there is no team UI', async ({ page }) => {
  await openApp(page, { viewer: true });
  await loadFile(page, sample('f1-2022-bahrain-race-timing.csv'));
  await tab(page, 'files');
  await expect(page.locator('#tshare')).toHaveCount(0);
  await expect(page.locator('h2', { hasText: 'Team sessions' })).toHaveCount(0);
});
