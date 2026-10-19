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

## Race timing

`f1-2022-bahrain-race-timing.csv` is the full lap chart of the 2022 Bahrain Grand Prix: 1,125 laps from all 20 cars. Columns: `Number`, `Driver`, `Team`, `Lap`, `Lap Time`, `S1`, `S2`, `S3`, `Compound`, `Tyre Life`, `Position`, `Race Time (s)` (time since the start at the end of the lap) and `Pit` (`In` or `Out`).

Load it with **Tick all shown**, pick a driver and open **Race call**. Stints split where the tyres change, and the **Stints and tyres** table compares wear and pace on each compound. Leclerc (winner) ran Soft, Soft, Medium and a used Soft after the late safety car. Because every car is in the file, the **Race picture** shows gaps, the lap chart, where a stop would rejoin, and how Verstappen's two undercut attempts on laps 14 and 30 played out.

## Telemetry

Car telemetry for the two fastest drivers in practice 2 at the 2020 70th Anniversary Grand Prix (Silverstone), ready for the Telemetry tab and the Compare overlay.

| File | Car | Laps | Fastest lap |
|---|---|---|---|
| `f1-2020-silverstone-fp2-44-hamilton-telemetry.csv` | #44 Mercedes (Hamilton) | 22 | 1:25.606 |
| `f1-2020-silverstone-fp2-77-bottas-telemetry.csv` | #77 Mercedes (Bottas) | 22 | 1:25.782 |

Columns: `Lap`, `Time (s)` (session time), `Distance (m)` (from the start of each lap), `Speed (km/h)`, `RPM`, `Gear`, `Throttle (%)`, `Brake` (on/off), `DRS`, `X (m)` and `Y (m)` (track position). Every lap is included, so in-laps, out-laps and laps through the garage appear as slow laps. There is no lateral g or steering channel in F1 data; Pacely estimates cornering force from the track shape.

Load both files, then open Telemetry for one driver or Compare for Hamilton against Bottas.

This 2020 session's recording has car numbers but no driver names; the names come from the 2020 Mercedes line-up.

## Race telemetry

Full-race car telemetry for the winner and runner-up of four Grands Prix. Same columns as the practice files above. These work on every tab: Race call reads the real lap times (tyre wear, stints, pit window), Telemetry explains any lap, and Compare puts the two drivers side by side.

| File | Race | Car | Laps | Fastest lap |
|---|---|---|---|---|
| `f1-2020-belgium-race-44-hamilton-telemetry.csv` | 2020 Belgian GP, 1st | #44 Hamilton, Mercedes | 44 | 1:47.758 (lap 28) |
| `f1-2020-belgium-race-77-bottas-telemetry.csv` | 2020 Belgian GP, 2nd | #77 Bottas, Mercedes | 44 | 1:47.983 (lap 27) |
| `f1-2020-italy-race-10-gasly-telemetry.csv` | 2020 Italian GP, 1st | #10 Gasly, AlphaTauri | 53 | 1:24.037 (lap 34) |
| `f1-2020-italy-race-55-sainz-telemetry.csv` | 2020 Italian GP, 2nd | #55 Sainz, McLaren | 53 | 1:23.882 (lap 40) |
| `f1-2021-saudi-arabia-race-44-hamilton-telemetry.csv` | 2021 Saudi Arabian GP, 1st | #44 Hamilton, Mercedes | 50 | 1:30.734 (lap 47) |
| `f1-2021-saudi-arabia-race-33-verstappen-telemetry.csv` | 2021 Saudi Arabian GP, 2nd | #33 Verstappen, Red Bull | 50 | 1:31.488 (lap 35) |
| `f1-2022-bahrain-race-16-leclerc-telemetry.csv` | 2022 Bahrain GP, 1st | #16 Leclerc, Ferrari | 57 | 1:34.570 (lap 51) |
| `f1-2022-bahrain-race-55-sainz-telemetry.csv` | 2022 Bahrain GP, 2nd | #55 Sainz, Ferrari | 57 | 1:35.740 (lap 52) |

Safety cars, red flags (Monza 2020 and Jeddah 2021) and pit stops are all in the data. Pacely leaves out the slow laps and finds pit stops where the car stands still, so stints split at each stop. Load one race (two files) at a time.

## Source

Official Formula 1 live timing and car data, as recorded in the open-source FastF1 project's test data (github.com/theOehrly/fastf1-test-data) and processed with FastF1. Timing and telemetry data © Formula One World Championship Limited. Included here for testing Pacely only.
