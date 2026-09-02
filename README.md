# Sentinel SIEM — Interactive SOC Simulator Dashboard

A fully client-side, SIEM-style Security Operations Center (SOC) dashboard built with React and TypeScript. It simulates the core workflow of a real SIEM — log ingestion, regex-based parsing, sliding-window threat detection, alert triage, and threat intelligence — entirely in the browser, using a synthetic log generator and a custom rule engine.

Built as a portfolio project to demonstrate front-end engineering, security domain knowledge, and the ability to model a realistic detection pipeline without needing a live backend.

---
## Overview

Sentinel SIEM recreates the analyst-facing experience of tools like Splunk, QRadar, or Microsoft Sentinel — but as a self-contained, front-end-only application. Raw log lines (Apache/Nginx, Linux `auth.log`, IPTables/firewall) are parsed with regex directly in TypeScript, evaluated against configurable detection rules, and surfaced as alerts on a live dashboard.

Because everything runs client-side with a synthetic data layer, the entire attack-detection lifecycle can be demoed instantly in a browser — no server, database, or deployment required — while still faithfully modeling how a real SIEM's ingestion → parsing → detection → alerting pipeline works.

---

## Features

- **Regex-based log parser** — handles three log formats out of the box: Apache/Nginx combined log format, Linux SSH `auth.log`, and IPTables/firewall syslog, normalizing all of them into one common `LogEvent` schema
- **Sliding-window detection engine** — configurable, toggleable rules:
  - Brute-force login detection (failed auth attempts per IP within a time window)
  - Sensitive path / reconnaissance probing (`/admin`, `/.env`, `/wp-login.php`, `.git/config`, etc.)
  - SQL injection / XSS payload detection via pattern matching
- **Live SOC dashboard**
  - KPI cards (total ingest, active alerts, critical alerts, unique IPs, auto-blocked IPs) — each clickable to filter the view
  - Event volume timeline chart with 1H / 24H / 7D ranges and hoverable incident markers
  - Alert severity breakdown panel with click-to-filter
  - Global threat origin map with animated attack-beam visualization
  - Top attacking IPs table with one-click "Triage" and "Ban" actions
- **Alert triage workflow**
  - Kanban board (Open → Investigating → Pending → Closed) with drag-free status dropdowns
  - Flat list view as an alternative to the board
  - Full alert filter modal (severity + status)
- **Threat intelligence & mitigation**
  - Manual IP quarantine form and blocklist export
  - Top targeted endpoints breakdown
  - Per-IP investigation dossier modal with a generated firewall rule (`iptables` / AWS NACL) ready to copy
- **Log Explorer** — searchable, filterable raw log stream with expandable rows showing the original unparsed log line
- **SOC traffic simulator toolbar** — inject synthetic attack scenarios (SSH brute force, SQL injection wave, dotfile recon, port sweep) on demand, or run a continuous live log stream at adjustable speed
- **Notifications drawer** — dispatch-style panel surfacing critical and high-severity alerts
- **Responsive navigation** — desktop side nav + mobile bottom nav, both with live unread-alert badges

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| UI framework | React (with TypeScript) | Component-driven, type-safe, matches how the app is actually structured (functional components + hooks) |
| Language | TypeScript | Strong typing across `LogEvent`, `SecurityAlert`, `DetectionRule`, `AttackingIP`, etc. — catches shape mismatches between parser, engine, and UI |
| Styling | Tailwind CSS (utility classes) | Fast iteration on a dense, data-heavy dashboard UI; consistent dark "SOC command center" theme |
| Icons | Material Symbols (Google) | Lightweight icon set used throughout nav, buttons, and status indicators |
| State management | React `useState` / local component state | No external state library — state is lifted to the top-level app/`Dashboard` component and passed down via props |
| Log parsing | Custom regex parser (`detectionEngine.ts`) | Parses Apache/Nginx, SSH `auth.log`, and IPTables formats into a normalized `LogEvent` schema |
| Detection logic | Custom rule engine (`detectionEngine.ts`) | Sliding-window, rule-based evaluation — brute force, sensitive-path probing, SQLi/XSS pattern matching |
| Data source | Synthetic/mock data (`mockSiemData.ts`) + in-browser generator | No backend or database — attack scenarios and baseline traffic are generated client-side so the whole pipeline runs standalone |
| Charts / visuals | Hand-built SVG (timeline chart, threat map) | Full control over the "SOC command center" aesthetic without pulling in a charting library |

> This is a **front-end-only simulation**. There is no real backend, database, or live network capture — the "ingestion" and "detection" happen against synthetic and user-pasted log text inside the browser. See [Limitations](#limitations) below.

---

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
│  Raw log text        │ --> │  parseRawLogLine()    │ --> │  Normalized LogEvent    │
│  (pasted / synthetic)│     │  (regex parser)       │     │  (common schema)        │
└─────────────────────┘     └──────────────────────┘     └───────────┬────────────┘
                                                                       │
                                                       ┌───────────────▼───────────────┐
                                                       │  evaluateDetectionRules()      │
                                                       │  (sliding-window rule engine)  │
                                                       └───────────────┬───────────────┘
                                                                       │
                                                            ┌──────────▼─────────┐
                                                            │   SecurityAlert[]   │
                                                            └──────────┬─────────┘
                                                                       │
                                ┌──────────────────────────────────────┼──────────────────────────────────────┐
                                │                                      │                                      │
                      ┌─────────▼─────────┐               ┌────────────▼───────────┐              ┌────────────▼───────────┐
                      │   Dashboard view   │               │  Alerts Triage (Kanban) │              │  Threat Intel & Log     │
                      │  (KPIs, timeline,  │               │  + Investigate Modal    │              │  Explorer views         │
                      │   map, live table) │               │                         │              │                         │
                      └────────────────────┘               └─────────────────────────┘              └─────────────────────────┘
```

**Data flow in plain terms:**
1. Raw log lines come from either the built-in synthetic generator (`SocSimulatorToolbar`, `PRESET_ATTACK_SCENARIOS`) or text pasted into the Rule Engine / Ingest view.
2. `parseRawLogLine()` regex-matches the line against Apache/Nginx, SSH auth, or firewall formats and returns a normalized `LogEvent`.
3. `evaluateDetectionRules()` runs each enabled `DetectionRule` against the batch of parsed events (e.g., counting failed logins per IP within a time window).
4. Rule matches become `SecurityAlert` objects with a severity, description, related IP/geo data, and a raw log sample.
5. New logs and alerts are lifted into top-level state and passed down as props to the `Dashboard`, `AlertsTriageView`, `ThreatIntelView`, and `LogStreamView` components.
6. Every view reads from the same shared state, so blocking an IP, changing an alert's status, or injecting an attack scenario updates all relevant panels immediately.

---

## Project Structure

```
sentinel-siem/
├── components/
│   ├── TopAppBar.tsx              # Header: search, live toggle, time range, notifications
│   ├── SideNav.tsx                # Desktop navigation
│   ├── BottomNav.tsx              # Mobile navigation
│   ├── Dashboard.tsx              # Main dashboard layout composing all widgets
│   ├── KpiRow.tsx                 # Clickable KPI summary cards
│   ├── EventTimelineChart.tsx     # SVG event-volume chart with hoverable incidents
│   ├── AlertSeverityDiamond.tsx   # Severity breakdown panel
│   ├── LiveAlertsTable.tsx        # Live, filterable alerts table
│   ├── TopAttackingIpsTable.tsx   # Top attacking IPs with triage/ban actions
│   ├── GlobalThreatMap.tsx        # Animated SVG threat-origin map
│   ├── AlertsTriageView.tsx       # Kanban + list view for alert triage
│   ├── AlertFilterModal.tsx       # Severity/status filter modal
│   ├── InvestigateModal.tsx       # Per-IP/alert investigation dossier
│   ├── NotificationsDrawer.tsx    # Slide-out critical/high alert dispatch panel
│   ├── LogStreamView.tsx          # Searchable raw log explorer with CSV export
│   ├── RuleEngineView.tsx         # Rule config + manual log ingest/test console
│   ├── ThreatIntelView.tsx        # IP blocklist, manual quarantine, top targeted endpoints
│   └── SocSimulatorToolbar.tsx    # Floating toolbar to inject synthetic attacks
├── utils/
│   └── detectionEngine.ts         # Log parser, geo lookup, rule engine, synthetic attack generator
├── data/
│   └── mockSiemData.ts            # Preset attack scenarios + baseline mock data
├── types.ts                       # Shared TypeScript interfaces (LogEvent, SecurityAlert, etc.)
├── App.tsx                        # Top-level state + view routing
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/<your-username>/sentinel-siem.git
cd sentinel-siem
npm install
npm run dev
```
Then open `http://localhost:5173` (or whatever port your dev server prints) in your browser.

### Trying it out
- Click **Inject Surge** in the top bar, or use the **SOC Traffic Simulator** toolbar (bottom-right) to fire a synthetic SSH brute-force, SQL injection, dotfile recon, or port sweep attack.
- Watch the KPI cards, timeline, and live alerts table update in real time.
- Open the **Ingest & Rules** tab to paste your own raw log lines and see them parsed and evaluated against the active detection rules.
- Click any alert to open the **Investigate** modal and see a generated firewall rule you can copy.

---

## How Detection Works

| Rule type | Logic | Default severity |
|---|---|---|
| `brute_force` | Groups failed-auth events (`statusCode === 401` or `attackType` containing "Failed") by source IP; alerts if the count within the configured window exceeds the threshold | Critical |
| `sensitive_path` | Regex-matches request endpoints against a list of sensitive paths (`.env`, `.git`, `wp-login`, `actuator`, `xmlrpc`, `phpmyadmin`, `admin/auth`, etc.) | High |
| `sqli_xss` | Regex-matches endpoint/raw log text for SQLi/XSS indicators (`UNION SELECT`, `1=1`, `--`, `<script`, `javascript:`, etc.) | Critical/High |

Each rule is independently toggleable from the **Ingest & Rules** view, and every match tracks a `matchCount` so you can see which rules are actually firing.

---

## Simulated Attack Scenarios

Four preset scenarios are built into the SOC Traffic Simulator for demoing the pipeline instantly:

1. **SSH Brute Storm** — 8 rapid failed SSH logins from `185.17.43.99` (Russia) → triggers the brute-force rule at **Critical** severity.
2. **SQL Injection Wave** — `UNION SELECT` payloads against `/api/v2/catalog` from `91.200.12.5` (Brazil) → triggers the SQLi rule at **Critical** severity.
3. **Dotfile Recon** — automated crawler hitting `/.env`, `/.git/config`, `/actuator/env` → triggers the sensitive-path rule at **High** severity.
4. **Port Sweep** — TCP SYN scan across common admin ports (21, 22, 80, 443, 3389, 8080) from `45.22.19.112` (China) → logged as a firewall-dropped anomaly.

*(Add screenshots of each scenario firing and the resulting alert card for the strongest portfolio impression.)*

---

## Screenshots

*(Add screenshots here: the main dashboard, the Kanban triage board, the investigate modal with the generated firewall rule, and the global threat map.)*

---

## Design Decisions

- **Front-end-only simulation over a real backend**: keeps the project instantly runnable and demoable (no server/DB setup for a reviewer to deal with) while still implementing a genuine parse → detect → alert pipeline in TypeScript.
- **Rule-based detection over ML**: every alert traces back to a specific, readable rule (`ruleTriggered`), which is important for explainability in a security tool and easy to reason about in code review.
- **Normalized `LogEvent` schema**: all three log formats (web, auth, firewall) are parsed into one shared shape, mirroring how real SIEMs unify heterogeneous log sources before detection runs.
- **Synthetic data generator instead of static fixtures**: lets the dashboard demonstrate a "live" SOC feel — KPIs, timeline, and alerts update as scenarios are injected, rather than showing a frozen dataset.
- **Kanban + list views for triage**: reflects how real SOC analysts track incident status, not just a flat alert log.

---

## Limitations

- No real backend, database, or persistent storage — all state resets on page reload.
- Detection runs against pasted or synthetically generated log text, not live network/log capture.
- Regex-based parsing supports three specific log formats; arbitrary/unusual log formats will fall through to the generic fallback parser.
- Geo-IP mapping in `getGeoForIp()` is a hardcoded lookup table for demo purposes, not a real geolocation service.
- Not intended for production security monitoring — this is a learning/portfolio project.

---

## Future Work

- Wire up a real backend (e.g., FastAPI or Node/Express) with persistent storage so alerts and rule state survive reloads
- Replace the hardcoded geo-IP table with a real IP geolocation API (ip-api.com, MaxMind GeoLite2)
- Add WebSocket-based live log streaming instead of manual injection
- Support additional log formats (Windows Event Log, AWS CloudTrail, Azure Activity Log)
- Add an anomaly-detection model (e.g., Isolation Forest) as a complement to the rule-based engine
- Role-based views (analyst vs admin) and authentication

---

## License

This project is open source under the [MIT License](LICENSE).#   S e n t i n e l - s i e m  
 