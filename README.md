# Pacely

Race engineering for small teams. Drop in lap times or logger telemetry and Pacely cleans them up, splits stints, measures tyre wear, tells you when to pit, finds your ideal qualifying lap and explains every channel of a lap.

The whole app is one file, `index.html`. Sessions are saved in the browser on your device and are never uploaded.

## Features

- **Import:** Excel (.xlsx) or CSV/TSV/TXT, drag and drop, or paste straight from Excel. Every visible sheet with lap data becomes a session. Timing sheets with many cars split into one session per car. Older .xls files need saving as .xlsx or CSV first.
- **Race call:** tyre loss per lap, pit window, a laps-to-go check (0 means the race is finished), stints split at pit stops, fuel effect per session, and corner-by-corner problems.
- **Qualifying:** runs, push laps, where the tyres peak, and an ideal lap from sector times (S1, S2, S3 columns).
- **Telemetry:** one lap explained channel by channel against your fastest lap: speed, time gap, throttle, braking, gear, RPM, longitudinal and lateral g, steering. With a track map from GPS or X/Y position, a lap anatomy strip and a corner-by-corner table.
- **Compare:** two sessions side by side, with a telemetry overlay and where the time is won or lost corner by corner.
- **AI engineer:** on the Race call, Qualifying and Telemetry tabs. A one-click debrief and plain-English answers based only on the numbers on that page.
- **Export:** save any report as PDF, download a session as CSV.

## Running it

Open `index.html` in a browser. Nothing needs installing to use the app.

## Tests

```
npm install
npx playwright install chromium
npm test
```

The suite (in `tests/`) loads the app in a real browser and checks imports, the race call, qualifying, telemetry, compare, PDF and CSV saves, the AI engineer and phone layout, using the files in `samples/` and `tests/fixtures/`. It also runs on every push through GitHub Actions. To use a Chromium you already have, set `PW_CHROMIUM_PATH` to its path.

## Deploying to Netlify

`netlify.toml` publishes only `index.html` and `icons/`, and deploys the AI function in `netlify/functions/ask.mjs`.

1. In Netlify, open the site, then **Project configuration → Build & deploy → Link repository**, and choose this repository with branch `main`. The build settings come from `netlify.toml`.
2. Under **Project configuration → Environment variables**, add `ANTHROPIC_API_KEY` with your Anthropic API key, scoped to Functions.
3. Every push to `main` then redeploys the site.

## AI engineer

Inside the Claude artifact viewer, the AI engineer uses the viewer's built-in access to Claude, so no key is needed. Anywhere else it calls `POST /.netlify/functions/ask` with `{ system, messages }` and expects `{ text }` or `{ error }` back. The function uses Claude Opus 5.5 and needs `ANTHROPIC_API_KEY`. Only the numbers shown on the page are sent, never your files.

## Sample data

`samples/` holds real Formula 1 qualifying timing and practice and race telemetry for testing. See `samples/README.md` for what each file contains and where it comes from.
