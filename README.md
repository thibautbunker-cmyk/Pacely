# Pacely

Race calls for small teams. Drop in lap times from any logger or timing sheet and Pacely cleans them up, splits stints, measures tyre wear and tells you when to pit.

Everything runs in the browser from a single file, `index.html`. Sessions are saved on the device (IndexedDB) and never uploaded.

## Features

- Load Excel (.xlsx) or CSV/TSV/TXT files, drag and drop, or paste straight from Excel. Every visible sheet with lap data becomes a session; older .xls files need saving as .xlsx or CSV first
- Reads lap-time lists, lap-and-corner tables, or raw telemetry over time
- Race call: tyre loss per lap, pit window, laps-to-go check, corner-by-corner problems
- Qualifying: runs, push laps, where the tyres peak, and an ideal lap from sector times (S1, S2, S3 columns)
- Telemetry: one lap explained channel by channel (speed, time gap, throttle, braking, longitudinal and lateral g, steering) against your fastest lap, with a lap anatomy strip and a corner-by-corner table
- Compare two sessions side by side, with a telemetry overlay (speed, gap, throttle, brake, steering by distance) and where the time is won or lost corner by corner
- Print or save a report as PDF, download a session as CSV
- Optional AI explanation of a session (see below)

## Running it

Open `index.html` in a browser, or serve the folder with any static host (for example Netlify).

## Optional AI helper

The "Ask AI about this session" panel calls `POST /.netlify/functions/ask` with `{ system, messages }` and expects `{ text }` back. That function is not in this repo yet, so on a plain static host the panel shows "AI is not set up on this site yet".

## Not included yet

`index.html` links to `icons/favicon.svg` and `icons/icon-192.png`, which are not in the repo. The page works without them, but the browser tab and home-screen icon will be missing until they are added.
