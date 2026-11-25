# 3D Print Settings

Slicer settings for **your exact printer, filament and type of part**, in the browser, with no sign-up.

Pick a printer, a filament (for example *Sunlu PETG* or *Bambu Lab PA6-CF*) and what you're printing (miniature, car part, smooth decor, engineering part…). The app suggests the ideal nozzle, layer height and support material, then calculates temperatures, speeds, cooling, retraction and printer-specific tips. You can export the result for your slicer.

> **Values are starting points.** They come from manufacturers' data sheets, printer specs and community experience. Always run a temperature tower and a flow test with a new spool, and follow your spool's label if it says otherwise.

## Features

- **45 printers**, including multi-tool and tool-changer machines (Bambu Lab, Prusa, Creality, Elegoo, Anycubic, Qidi, Snapmaker, Flashforge, Voron).
- **330+ filaments** from Bambu Lab, Prusament, Polymaker, Sunlu, eSun, Qidi, Elegoo, Creality, Overture, colorFabb, Recreus and NinjaTek, plus generic profiles.
- **Nozzle types**: standard, hardened, high flow and hardened high flow, with abrasive-filament warnings.
- **Support material** for dual and multi-tool printers: dedicated support filaments first, then catalogue filaments that peel off easily (for example PLA under TPU), then any other filament, with warnings when the pair isn't a known easy-release one. The support nozzle size and type can be changed, including mixed sizes on printers that allow them.
- **Printer-specific tips**, for example how long to let the bed heat-soak after it reports its temperature.
- **Drying and storage** instructions for every filament.
- **Live results**: everything recalculates as you change a selection.
- **Exports**: full text sheet, OrcaSlicer / Bambu Studio filament profile (.json) and PrusaSlicer config (.ini).
- **Your last 10 queries**, kept in your browser only.
- **Display options**: light or dark (following your system or chosen by hand), a high-contrast style and a low-vision style with larger text, Synthwave and Monokai styles, and five font pairs, including the hyperlegible Atkinson and an 8-bit pixel pair. Styles live in one file and are easy to edit: see [docs/THEMING.md](docs/THEMING.md).
- **9 languages**: English, 中文, Deutsch, 日本語, Español, Français, Português, Italiano, 한국어.

## Run it locally

It's a static site with no build step and no dependencies. The translation files are loaded with `fetch`, so serve the folder rather than opening `index.html` from disk:

```bash
git clone https://github.com/3dpThings/3d-print-settings.git
cd 3d-print-settings
python3 -m http.server 8000      # or: npx serve .
```

Then open <http://localhost:8000>.

## Check your changes

```bash
node scripts/check.mjs
```

It validates the translations and the catalogue data, then runs the engine over every printer × filament × print type combination. You need Node 18 or later. The same check runs automatically on every pull request.

## Project structure

```
index.html              Markup; loads the scripts in order
css/themes.css          Colours, sizes and fonts of every style (edit this to restyle)
css/styles.css          Layout and components
js/i18n.js              Translation loader and T() helper
js/config.js            Site settings (repository URL for the footer links)
js/data/                Catalogue: printers, filaments, material classes, print types, support materials
js/engine/              Calculations: settings, warnings, tips, printer and nozzle suggestions
js/ui/                  Form, results sheet, exports, history, language and theme switches, searchable dropdown
js/main.js              Event wiring and start-up
i18n/<lang>.json        UI strings and tips, one file per language
scripts/check.mjs       Data, translation and engine checks (no dependencies)
docs/MAINTAINING.md     How maintainers triage issues and review pull requests
```

The scripts are plain browser scripts that share globals, loaded in the order listed in `index.html`. `js/data` and `js/engine` never touch the DOM, so they also run in Node for the checks.

## Contributing

Missing printer or filament? Wrong value? New translation? Contributions are very welcome, and you don't need to be a programmer to help:

- **Request** a printer or filament, or report settings that didn't work, using the [issue forms](../../issues/new/choose).
- **Add it yourself**: [CONTRIBUTING.md](CONTRIBUTING.md) explains each field and where to find the values.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before taking part.

## Privacy

There's no back end, no account and no analytics. Your history, language and display choices stay in your browser's `localStorage`. The page loads its fonts from Google Fonts; self-hosting them is on the to-do list.

## Licence and trademarks

[MIT](LICENSE) © The 3D Print Settings contributors.

Brand and product names are trademarks of their respective owners. This project isn't affiliated with or endorsed by any printer or filament manufacturer.
