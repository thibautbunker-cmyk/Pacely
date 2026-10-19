// Runs the Pacely test suite against index.html opened from disk.
// Set PW_CHROMIUM_PATH to use an existing Chromium instead of Playwright's download.
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 90_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    viewport: { width: 1360, height: 900 },
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
});
