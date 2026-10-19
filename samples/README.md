# Real F1 data

## Qualifying timing

Lap-by-lap timing from three real Formula 1 qualifying sessions, ready to load into Pacely's Qualifying tab.

| File | Session | Laps | Cars | Fastest lap |
|---|---|---|---|---|
| `f1-2024-spain-qualifying.csv` | 2024 Spanish GP, qualifying | 159 | 20 | Norris 1:11.383 (pole) |
| `f1-2023-azerbaijan-qualifying.csv` | 2023 Azerbaijan GP, qualifying | 210 | 20 (18 with 3+ laps) | Leclerc 1:40.203 (pole) |
| `f1-2024-china-sprint-qualifying.csv` | 2024 Chinese GP, sprint qualifying | 153 | 20 | Verstappen 1:35.606 (dry SQ1; rain came for SQ3) |

Columns: `Number`, `Driver`, `Team`, `Lap`, `Lap Time` (m:ss.000), `S1`, `S2`, `S3` (seconds), `Compound`, `Tyre Life`. Laps without a lap time and laps deleted for track limits are left out.

## Loading a file

1. Load lap file, then pick the CSV.
2. Pacely finds 20 cars and asks which to load. Choose **Tick all shown**, then **Load selected**.
3. Open **Qualifying** and pick a driver from the session list.

Load one event at a time (or use **Clear all sessions** on the Files tab first), because the ranking table compares every loaded session.

## Telemetry

Car telemetry for the two fastest drivers in practice 2 at the 2020 70th Anniversary Grand Prix (Silverstone), ready for the Telemetry tab and the Compare overlay.

| File | Car | Laps | Fastest lap |
|---|---|---|---|
| `f1-2020-silverstone-fp2-44-hamilton-telemetry.csv` | #44 Mercedes (Hamilton) | 22 | 1:25.606 |
| `f1-2020-silverstone-fp2-77-bottas-telemetry.csv` | #77 Mercedes (Bottas) | 22 | 1:25.782 |

Columns: `Lap`, `Time (s)` (session time), `Distance (m)` (from the start of each lap), `Speed (km/h)`, `RPM`, `Gear`, `Throttle (%)`, `Brake` (on/off), `DRS`, `X (m)` and `Y (m)` (track position). Every lap is included, so in-laps, out-laps and laps through the garage appear as slow laps. There is no lateral g or steering channel in F1 data; Pacely estimates cornering force from the track shape.

Load both files, then open Telemetry for one driver or Compare for Hamilton against Bottas.

This 2020 session's recording has car numbers but no driver names; the names come from the 2020 Mercedes line-up.

## Source

Official Formula 1 live timing and car data, as recorded in the open-source FastF1 project's test data (github.com/theOehrly/fastf1-test-data) and processed with FastF1. Timing and telemetry data © Formula One World Championship Limited. Included here for testing Pacely only.
