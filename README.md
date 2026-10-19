# Pacely

Race engineering for small teams. Drop in lap times or logger telemetry and Pacely cleans them up, splits stints, measures tyre wear, tells you when to pit, finds your ideal qualifying lap and explains every channel of a lap.

The whole app is one file, `index.html`. Sessions are saved in the browser on your device. They only leave it when you choose Share with team inside the Claude viewer.

## Features

- **Import:** Excel (.xlsx) or CSV/TSV/TXT, drag and drop, or paste straight from Excel. Every visible sheet with lap data becomes a session. Tyre compound, tyre age and pit in/out columns are read when present. Timing sheets with many cars split into one session per car. Sessions are grouped by event (the file they came from), file names are tidied into readable session names, and the Files tab can remove a whole event. Older .xls files need saving as .xlsx or CSV first.
- **Race call:** tyre loss per lap, pit window, a laps-to-go check (0 means the race is finished), stints split at pit stops and tyre changes, wear and pace compared by tyre compound, fuel effect per session, and corner-by-corner problems.
- **Race picture:** load a timing sheet with every car (position and race time columns) and the race call shows your position, the gaps ahead and behind and how fast they change, where you would rejoin if you pitted now (pit loss measured from the stops in the file), undercut threats and chances, a lap chart, and how each of your stops went against nearby cars. Pick any lap with "As of lap".
- **Qualifying:** runs, push laps, where the tyres peak, and an ideal lap from sector times (S1, S2, S3 columns), and the tyres used on each run.
- **Telemetry:** one lap explained channel by channel against your fastest lap, plus a theoretical best lap from your best mini-sectors: speed, time gap, throttle, braking, gear, RPM, longitudinal and lateral g, steering. With a track map from GPS or X/Y position, a lap anatomy strip and a corner-by-corner table.
- **Driver sheet:** from the Telemetry tab, a one-page sheet for the driver with the three corners where the lap loses most against their own best through each corner, what to change there (brake point, apex speed, throttle, gear), a track map, and the corners to keep doing. Saves as PDF.
- **Compare:** two sessions side by side, with a telemetry overlay and where the time is won or lost corner by corner.
- **AI engineer:** on the Race call, Qualifying and Telemetry tabs. A one-click debrief and plain-English answers based only on the numbers on that page.
- **Units:** speeds in km/h or mph (Settings on the Files tab). The choice is remembered on this device.
- **Team sessions:** inside the Claude artifact viewer, "Share with team" (or "Share whole event") on the Files tab puts a copy of a session, telemetry included, in the page's shared store. Everyone who can open the page sees it under Team sessions and can open it on their own device. Contributors and above can share and remove; viewers can only open. The Netlify site has no shared store, so this is viewer-only.
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
