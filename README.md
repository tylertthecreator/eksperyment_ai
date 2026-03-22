# Eksperyment AI — jsPsych (browser task)

Online behavioral task built with **[jsPsych 7](https://www.jspsych.org/)** in the browser. Participants see multiple-choice questions with **simulated “AI” suggestions** (content is **predefined** in a spreadsheet, presented with a short “searching / streaming” animation). Responses, reaction times, group assignment, and optional Likert blocks are saved to a **CSV** file downloaded at the end of the session.

---

## Features

- **40 questions** (or any count) loaded from generated `questions_data.js` (exported from Excel).
- **Between-subjects groups** (rotacja A→B→C przez `/api/next-condition`, przy awarii losowo):
  - `with_explanation` — sugerowana litera + wyjaśnienie z arkusza.
  - `without_explanation` — tylko sugerowana litera.
  - `no_suggestion` — bez bloku AI (tylko pytanie + A–D).
- **Reaction time (RT)** — jsPsych records time from stimulus onset to button click (`rt`); optional derived fields include stream duration and adjusted RT (see [Data output](#data-output)).
- **Running score** — “correct / answered so far” in the top-right corner.
- **Responsibility Likert** — 1–10 scale after selected question indices (configurable; tabela poniżej).
- **UI** — stacked answer options, vertical A–D buttons, footer disclaimer about AI errors, staged “searching” → “suggested answer” animation (`ai_stream.js` + `local.css`).

---

## Przebieg badania (kolejność ekranów)

| Krok | Treść                                                                                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | **Demografia** — 4 pytania (wielokrotny wybór): wiek, płeć, użycie technologii, użycie narzędzi AI                                                                                                                   |
| 1    | **Placeholdery** — pytania o technologie / zaufanie (Likert 1–5), plik `trust_placeholders.js`                                                                                                                       |
| 2    | **Skala Delta — część 1** — 12 pozycji Likerta _przed_ zadaniem (`DELTA_ITEMS_PART1`, `delta_timing: pre_task`)                                                                                                      |
| 3    | **Zadanie główne** — 40 pytań bazowych z ewentualnym blokiem AI (20 sugestii poprawnych / 20 sugestii błędnych); między pytaniami mogą pojawić się skale odpowiedzialności (tabela niżej: _Skala odpowiedzialności_) |
| 4    | **Skala Delta — część 2** — 12 pozycji Likerta _po_ zadaniu (`DELTA_ITEMS_PART2`, `delta_timing: post_task`)                                                                                                         |
| 5    | **Zakończenie** — podziękowanie za udział w badaniu                                                                                                                                                                  |

---

## Tech stack

| Piece                   | Role                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **jsPsych 7**           | Experiment engine, timeline, data                                                  |
| **ES modules**          | `experiment.js` imports plugins and `questions_data.js`                            |
| **import map**          | Resolves bare `jspsych` import for plugins (`index.html`)                          |
| **npm**                 | `jspsych`, `@jspsych/plugin-html-button-response`, `@jspsych/plugin-survey-likert` |
| **Python 3 + openpyxl** | Optional: regenerate `questions_data.js` from `.xlsx` (`generate_questions.py`)    |

---

## Repository layout

```
eksperyment_ai/
├── index.html           # Entry page, CSS + importmap + experiment.js
├── experiment.js        # Timeline, groups, trials, CSV save
├── ai_stream.js         # “Searching” delay + typewriter timing helpers
├── local.css            # Layout, AI panel, buttons, footer
├── questions_data.js    # EXPORTED questions (do not edit by hand — regenerate from Excel)
├── generate_questions.py
├── package.json
├── package-lock.json
└── README.md
```

---

## Prerequisites

- **Node.js** (LTS recommended) and **npm**
- **Local HTTP server** — required because the app uses ES modules (opening `index.html` as `file://` is unreliable)
- **Python 3** + **openpyxl** only if you regenerate questions from Excel:
  ```bash
  pip install openpyxl
  ```

---

## Quick start (local)

```bash
cd eksperyment_ai
npm install
npm start
```

Then open the URL printed by the static server (e.g. **http://localhost:3000**).

Alternative without `npm start`:

```bash
npx --yes serve -l 3000 .
# or
python3 -m http.server 8080
```

---

## Updating questions from Excel

1. Prepare a spreadsheet with columns (header row):

   | Column                           | Meaning                                                    |
   | -------------------------------- | ---------------------------------------------------------- |
   | `Nr`                             | Question number                                            |
   | `Pytanie`                        | Question stem                                              |
   | `Opcje`                          | Single line with `A) … B) … C) … D) …`                     |
   | `KLUCZ`                          | Correct option letter (`A`–`D`)                            |
   | `SUGESTIA`                       | Letter suggested as “AI” (may differ from key — by design) |
   | `WYJAŚNIENIE (Tylko dla Gema B)` | Explanation text for the `with_explanation` group          |

2. Run the generator (default path is `~/Downloads/Konfiguracja testu AI z bazą pytań.xlsx`; override with a path argument):

   ```bash
   python3 generate_questions.py
   python3 generate_questions.py "/path/to/your/file.xlsx"
   ```

3. This overwrites **`questions_data.js`**. Commit the updated file if you use Git.

---

## Configuration (`experiment.js`)

### Stałe i przydział warunków

| Stała / mechanizm                            | Opis                                                                                                                                                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESPONSIBILITY_LIKERT_AFTER_QUESTION_INDEX` | Tablica **indeksów 0-based** w `QUESTIONS`: po udzieleniu odpowiedzi na dane pytanie pokazuje się ekran skali odpowiedzialności (1–10). Domyślnie: `[3, 8, 13, 18, 23, 31, 38]`. Ustaw `[]`, żeby wyłączyć. |
| `ai_group`                                   | Warunki międzyczynnikowe: przydział rotacyjny **A→B→C** przez `/api/next-condition` + Google Apps Script (`doGet`), przy awarii lub braku URL — losowo.                                                     |

### Skala odpowiedzialności — po których pytaniach bazowych (numeracja 1–40)?

Ekran skali (1–10: „Na ile czujesz się odpowiedzialny/a…”) pojawia się **zaraz po** udzieleniu odpowiedzi na wymienione pytanie:

| Kolejność bloku skali | Po ukończeniu pytania nr |
| --------------------- | ------------------------ |
| 1                     | 4                        |
| 2                     | 9                        |
| 3                     | 14                       |
| 4                     | 19                       |
| 5                     | 24                       |
| 6                     | 32                       |
| 7                     | 39                       |

Indeksy **0-based** w kodzie (te same pozycje w tablicy `QUESTIONS`): `3`, `8`, `13`, `18`, `23`, `31`, `38`.

Participant ID:

- Query string: `?participant=YOUR_ID` (optional)
- Otherwise a random ID from jsPsych

---

## Data output

At the end of the experiment the browser downloads **`wyniki.csv`** via `localSave` (participant’s machine — **not** sent to a server unless you add a backend).

Typical columns include (exact set depends on jsPsych version and plugins):

- **Identifiers:** `participant_id`, `ai_group` (`with_explanation` / `without_explanation` / `no_suggestion`), `assignment_source`
- **Per MC trial:** `question_id`, `correct_key`, `response` (button index), `response_letter`, `correct`, `rt`, `rt_ms_stimulus_to_response`, running totals (`correct_so_far`, `answered_so_far`)
- **Pola związane z AI (tylko gdy `ai_group` ≠ `no_suggestion`):** `ai_suggestion_letter`, `ai_thinking_phase_ms`, `ai_stream_planned_ms`, `ai_stream_duration_ms`, `rt_minus_ai_stream_ms`, `waited_for_full_ai_stream` (1 = odpowiedź po zakończeniu animacji wg faktycznego czasu), `rt_minus_ai_stream_planned_ms`, `waited_for_full_ai_stream_planned` (wg zaplanowanego czasu). **Wszystkie te pola przy `no_suggestion` mają wartość `N/A` (tekst)** — żeby nie mieszać z brakiem odpowiedzi w analizie. Czasy w **milisekundach** (`rt`, `*_ms`).
- **Likert trials:** `measure`, `after_question_number`, named responses per plugin (e.g. `responsibility_after_q…`)

For remote data collection you must integrate **JATOS**, **Pavlovia**, a custom server, or another pipeline — the stock build does not upload CSV automatically.

---

## Deployment (e.g. Vercel, Netlify)

Static hosts often **do not serve `node_modules`** from the deployed URL (404 on `jspsych.css` / `index.js`). This project runs **`npm run build`** (and **`postinstall`**) to copy jsPsych + plugins into **`vendor/`** (gitignored). `index.html` and `experiment.js` load assets from `./vendor/...`.

1. Push this folder to a Git host.
2. **Install:** `npm ci` (or `npm install` — triggers `postinstall` → `vendor/`).
3. **Build:** `npm run build` (copies `vendor/` again; required on CI).
4. **Output directory:** project root (where `index.html` lives).

`vercel.json` sets `installCommand` + `buildCommand` so Vercel always produces `vendor/` before deploy. Override in the Vercel dashboard only if you know what you’re doing. `netlify.toml` in the repo is optional (Netlify-oriented).

---

## Research ethics note

The interface **simulates** a live AI. Stimuli are **fixed** in the spreadsheet. If your ethics board requires debriefing or explicit disclosure, add instructions and debrief screens in the timeline and adjust copy accordingly.

---

## Troubleshooting

| Issue                                        | What to try                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Blank page or module errors                  | Serve over **http(s)**, not `file://`. After `npm install`, check that **`vendor/jspsych/`** exists (run `npm run build` if needed). |
| 404 on `jspsych.css` or `index.js` on Vercel | Ensure **Build Command** runs (`npm run build`) and redeploy.                                                                        |
| Stacked trials / duplicate text              | `on_trial_start` clears `#jspsych-content` (already in `experiment.js`)                                                              |
| CSV not downloading                          | Browser may block multiple downloads; run one participant flow per tab                                                               |
| Options not splitting into lines             | `Opcje` must match pattern `A) … B) …` with spaces before each `A)`–`D)` marker                                                      |

---

## Scripts (`package.json`)

- **`npm start`** — static server on port 3000 (`serve`)

---

## License

ISC (see `package.json`). Third-party libraries (jsPsych, plugins) follow their respective licenses.
