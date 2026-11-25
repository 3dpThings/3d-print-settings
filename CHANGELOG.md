# Changelog

All notable changes to this project are listed here. Versions follow [semantic versioning](https://semver.org/): the major number changes when stored history or exported files stop being compatible, the minor number for new features, printers or filaments, and the patch number for fixes.

## [Unreleased]

- Added two display styles, Synthwave (80's look: Memphis in light mode, neon synthwave in dark mode) and Monokai (the Sublime Text colour scheme), and two font pairs: 80's (Audiowide, Exo 2, Share Tech Mono) and pixel (Press Start 2P, VT323).

- Completed the smaller filament brands: Prusament (PLA Blend, Blend Silk PLA, rPLA, PC, PETG Ultraglow, PVB, TPU 95A), Elegoo (Matte, Silk, Galaxy, Rapid PLA+, PLA-CF, PETG, PETG-CF/GF, Rapid TPU, ABS, ASA, PC, PAHT-CF), Creality (Hyper PLA-CF, CR-PLA, CR-PLA Matte, CR-Silk, CR-PETG, CR-ABS, HP-ASA, HP-TPU, CR-TPU, CR-Nylon, Hyper PA6-CF), Overture (Matte, Super PLA+, PLA Professional, Silk, Rock, Turbo, Easy, Air and Glow PLA, TPU, High Speed TPU, ABS, ASA, PC Professional, Easy Nylon), colorFabb (LW-PLA-HT, LW-ASA, PLA/PHA, XT, XT-CF20, nGen, nGen_FLEX, HT, PA-CF Low Warp, woodFill, bronzeFill, varioShore TPU, TPU 85A), Recreus (Filaflex 60A, 95 Foamy, PET-G HF, PET-G CF) and NinjaTek (NinjaFlex Edge, Chinchilla, Armadillo).

- Added 19 printers from brands already in the catalogue: Bambu Lab H2S, P2S and A2L; Prusa CORE One L / L+ and CORE One+ INDX (the CORE One entry now also covers the CORE One+); Creality K2 Pro, K2, K1 Max, SparkX i7 and Hi; Elegoo Centauri Carbon 2; Anycubic Kobra X; Qidi Plus5, Q2 and Q2C; Flashforge AD5X, Adventurer 5M and 5M Pro; Voron Trident. Each comes with its nozzle types and the matching printer tips.

- Renamed the "Car part" print type to "Car part / heat-resistant".

- Added Voxel (VOXELPLA) filaments: PLA+ HS, Galaxy PLA+ HS, PETG+ HS and Galaxy PETG+ HS.

- Added the Bambu Lab P3C (7-tool changer, enclosed without chamber heating, 300 °C hardened 0.2–0.8 mm nozzles, mixed nozzle sizes), with tips for tool swaps and soft TPU.

- Searchable dropdowns show the name on one line and the details below, wrapping instead of scrolling sideways.

- The support material dropdown now lists every filament: dedicated supports first, then easy-release filaments, then all others, with warnings for unknown pairs, same-family supports, abrasive supports on soft nozzles and particle-filled supports on small nozzles.
- Support nozzle size and type can now be changed on the Bambu Lab H2D, H2C and X2D (mixed sizes and flow types), with a warning to check Bambu Studio and firmware support for mixed sizes.
- New warning when the layer height is too thick for a smaller support nozzle.
- The ideal support nozzle type is hardened when the support filament is abrasive.

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
