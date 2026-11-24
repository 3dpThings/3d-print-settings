# Contributing

Thanks for helping! This project lives on community knowledge: every printer quirk, data-sheet value and translation makes it more useful for everyone.

You don't need to write code to contribute. The most valuable contributions are often:

- **Requesting** a printer or filament with a link to its specifications or technical data sheet (TDS).
- **Reporting settings that didn't work**, and what worked instead.
- **Translating** or fixing translations.

Open an issue with the matching [form](../../issues/new/choose). If you'd like to make the change yourself, read on.

---

## Before you start

1. For anything bigger than a data fix or translation, **open an issue first** so we can agree on the approach before you spend time on it.
2. Fork the repository and create a branch: `git checkout -b add-printer-ender-5-max`.
3. Run the app locally: `python3 -m http.server 8000` (or `npx serve .`), then open <http://localhost:8000>.
4. Before opening the pull request, run `node scripts/check.mjs` (Node 18+). It must end with `✓ All checks passed`.

**One topic per pull request** (one printer, one brand of filaments, one language…). Small PRs get reviewed and merged much faster.

## Sources and accuracy

Every new value needs a source. Put the links in the pull request description:

- **Filaments**: the manufacturer's technical data sheet, product page or the official slicer profile.
- **Printers**: the official spec page, wiki or manual.
- **Tips**: the manufacturer's wiki or forum post, or your own tested experience. Say which, and on which printer.

If a value is your estimate (for example a max volumetric speed with no official figure), say so in the PR. Don't copy text from data sheets or websites word for word: write the tips in your own words.

---

## Adding a filament

Edit `js/data/filaments.js` and add a line in the brand's block (or start a new block for a new brand):

```js
F('sunlu-petg', 'Sunlu', 'PETG', 'PETG', [220,250,235], [70,85,75], 12),
//  id           brand    name    class   nozzle °C      bed °C       max volumetric speed (mm³/s)
```

| Argument | Meaning |
|---|---|
| `id` | Unique, lowercase, `brand-product`. Never change an existing id: it's stored in people's history. |
| `brand`, `name` | As printed on the spool. Use `GEN` for generic profiles. |
| `class` | Material class from `js/data/materials.js` (`PLA`, `PLA_MATTE`, `PETG`, `PETG_CF`, `ABS`, `ASA`, `PC`, `PA_CF`, `TPU95`…). It decides cooling, retraction, enclosure needs, abrasiveness and drying. |
| `nozzle` | `[min, max, default]` from the data sheet. Pick a default in the middle unless the TDS recommends one. |
| `bed` | `[min, max, default]`. |
| `mvs` | Max volumetric speed for a 0.4 mm standard nozzle. Use the official slicer profile if there is one; otherwise a conservative value for the class. |
| `extra` | Optional overrides, for example `{maxSpeed:40}` for flexible filaments. |

If no existing class fits (a new material family, or a filled material with special behaviour), add a class in `materials.js`. Each class needs a `cls.<CLASS>` label and an `mt.<CLASS>` list of tips in `i18n/en.json`.

## Adding a printer

1. Add an entry to `PRINTERS` in `js/data/printers.js`:

| Field | Meaning |
|---|---|
| `id` | Unique, lowercase, `brand-model`. Never change an existing id. |
| `brand`, `model` | As sold. |
| `maxNozzle`, `maxBed` | Maximum temperatures in °C. |
| `chamber` | `'active'` (heated chamber, add `maxChamber` in °C), `'passive'` (enclosed, not heated) or `'open'`. |
| `hardened` | Stock nozzle is hardened: `true`, `false`, or `null` if unknown. |
| `drive` | `'direct'` or `'bowden'`. |
| `vol` | Build volume, formatted `'256 × 256 × 256 mm'`. |
| `flow` | Hotend max volumetric flow in mm³/s with a standard 0.4 mm nozzle. |
| `speedF` | Speed factor from 0 to 1: 1 for CoreXY machines around 500 mm/s, about 0.5 for entry-level bed slingers. |
| `nozzles` | Sizes the printer supports, in mm. |
| `soak` | Minutes to wait after the bed reports its temperature, before printing warp-prone materials. |
| `slinger` | `true` for bed-slinger (moving-bed) machines. |
| `tools`, `mm`, `mix` | Multi-tool only: number of tools; `'dual'`, `'changer'` or `'nozzle'` (nozzle-changing system); whether different nozzle sizes can be mixed in one print (`true`, `false` or `'exp'` for experimental). |
| `preheat` | Optional: minutes to preheat a passive chamber. |

2. If the printer has more than one nozzle type (hardened, high flow…), describe them in `NOZZLE_TYPES` in the same file: `{stock:'hard', types:{hard:[0.4,0.6,0.8], hfhard:[0.4,0.6,0.8]}}`. Types are `std` (brass/stainless), `hard`, `hf` (high flow) and `hfhard`.
3. Printer-specific tips go in `PRINTER_TIPS` in `js/engine/tips.js`:

```js
'cr-k3': {tips:[
  tp('enclosure', 'pt.k3.open', x => x.c.needsEncl),
]},
```

`tp(tag, i18nKey, condition, vars, isKey)`: the condition receives `{p, f, n, t, o, c, s}` (printer, filament, nozzle, print type, computed settings, material class, support). Add the text for each new key to `i18n/en.json`.

## Translations

- **Fix or complete a language**: edit `i18n/<code>.json`. Keep every `{placeholder}` exactly as in English, and keep lists (tips) the same length.
- **Add a language**: copy `i18n/en.json` to `i18n/<code>.json`, translate it, and add the language to `LANGS` in `js/i18n.js` (`code`, `file`, `locale`, native `name`).
- **New strings**: when you add a key to `en.json`, you don't have to translate it into every language. Missing keys fall back to English, and the check lists them as warnings so translators can pick them up.

Use the terms people actually use in your language's 3D-printing community. If a term is usually left in English (for example *brim*, *ironing* or *flow ratio* in some communities), leave it in English.

## Styles and fonts

Colours, text size and fonts are defined in `css/themes.css`, and the styles offered in the Display menu are listed in `js/config.js`. [docs/THEMING.md](docs/THEMING.md) explains how to add a style or a font pair.

## Code changes

- Plain browser JavaScript, no framework, no build step. Keep it that way unless we've discussed it in an issue.
- `js/data` and `js/engine` must not touch the DOM: they also run in Node for the checks.
- Every user-visible string goes through `T('key')` with the text in `i18n/en.json`. Don't hard-code text.
- Formatting: 2-space indentation, single quotes, semicolons. Follow the style of the surrounding code.
- Test in a narrow (mobile) and a wide window, in light and dark mode, and in a CJK language if you changed the layout.

## Commit messages and pull requests

- Short, imperative commit titles: `Add Creality K2 Pro`, `Fix PETG retraction on bowden printers`, `Update German translation`.
- Fill in the pull request template, including sources for any new values.
- A maintainer will review the PR, usually within a week. Expect questions about sources: they protect everyone's prints.

By contributing, you agree that your contribution is licensed under the [MIT licence](LICENSE) of this project.
