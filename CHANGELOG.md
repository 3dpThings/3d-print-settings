# Changelog

All notable changes to this project are listed here. Versions follow [semantic versioning](https://semver.org/): the major number changes when stored history or exported files stop being compatible, the minor number for new features, printers or filaments, and the patch number for fixes.

## [Unreleased]

- Display menu in the header with mode (system, light, dark), style and font pair.
- New styles: High contrast (WCAG AAA text contrast) and Low vision (20 % larger text, thicker borders and focus outline, low-glare background).
- New font pairs: serif headings (Source Serif 4 + Source Sans 3) and hyperlegible (Atkinson Hyperlegible Next + Mono).
- All colours, sizes and fonts moved to `css/themes.css`, documented in `docs/THEMING.md`; the check script validates the styles listed in `js/config.js`.

- Complete Bambu Lab, Polymaker and Sunlu catalogues: 91 new filaments (195 in total), including Polymaker G-Flex PETG, the Panchroma and Fiberon lines, HT-PLA, ABS Pro/Max and PolySmooth, and Sunlu's high-speed, PA and PC lines.
- New material classes: HT-PLA, HT-PLA-GF, CoPE, PVB, glow-in-the-dark PETG, elastic PETG (PETG/TPU), PC-ABS and Warp-Free nylon (cool bed, no heated chamber).
- New support materials: Polymaker PolySupport for PLA, PolySupport for PA12, PolyDissolve S1, and Sunlu PVA.
- Renamed Polymaker products to their current names (PolyTerra → Panchroma Matte, PolyMide PA6-CF → Fiberon PA6-CF20, PolyLite ASA → ASA).
- eSun catalogue completed (33 new lines) and the Qidi catalogue added (34 lines), plus eSun PVA and Qidi S-White support.
- New material classes: carbon-fibre ABS and foaming TPU (TPU Aero / TPU-LW).
- Filaments with glow pigment are now flagged as abrasive in the filament summary.

- Light/dark theme selector (System, Light, Dark) in the header; System follows the operating system setting.
- Wide screens: sections 01–04 come first again, with Printer and Filament side by side, and the settings below.

## [1.0.0] - 2026-11-23

First public release.

- 25 printers, including dual, multi-tool and tool-changer machines, with nozzle types (standard, hardened, high flow, hardened high flow).
- 104 filaments in 29 material classes, with drying and storage instructions.
- Suggested nozzle, layer height and support material for each printer, filament and print type.
- Live settings: temperatures, speeds, cooling, retraction, layer heights, plate and supports, plus printer-specific tips.
- Exports: text sheet, OrcaSlicer / Bambu Studio filament profile and PrusaSlicer config.
- History of the last 10 queries in the browser.
- 9 languages: English, Chinese (Simplified), German, Japanese, Spanish, French, Portuguese, Italian and Korean.
