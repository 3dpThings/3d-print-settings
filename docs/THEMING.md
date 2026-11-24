# Styles and fonts

The look of the app is defined in one file, [`css/themes.css`](../css/themes.css). `css/styles.css` only uses the variables declared there, so you can restyle the app without touching the layout.

Users choose the mode (system, light or dark), the style and the font pair in the **Display** menu in the header. The choices are stored in the browser and applied as attributes on `<html>`:

| Attribute | Values | Set by |
|---|---|---|
| `data-mode` | `light`, `dark` | Mode setting, or the operating system when the mode is *System* |
| `data-style` | `contrast`, `lowvision`, … (absent for the default style) | Style setting |
| `data-fonts` | `serif`, `legible`, … (absent for the default pair) | Fonts setting |

## Built-in styles

| Id | Name | What it changes |
|---|---|---|
| `default` | Standard | The original palette. |
| `contrast` | High contrast | Near-black on white (white on black in dark mode), darker secondary text, stronger borders and a thicker focus outline. Text meets WCAG AAA contrast (7:1). |
| `lowvision` | Low vision | Everything in high contrast, plus text 20 % larger, more line spacing, 2 px borders, a 4 px focus outline and a warm, low-glare background in light mode. |

## Built-in font pairs

| Id | Headings | Text | Numbers and labels |
|---|---|---|---|
| `tech` | Chakra Petch | IBM Plex Sans | IBM Plex Mono |
| `serif` | Source Serif 4 | Source Sans 3 | Source Code Pro |
| `legible` | Atkinson Hyperlegible Next | Atkinson Hyperlegible Next | Atkinson Hyperlegible Mono |

Atkinson Hyperlegible was designed by the Braille Institute for readers with low vision: similar letters (I, l, 1; O, 0) are clearly different.

## Adding a style

1. In `css/themes.css`, copy the *High contrast* blocks (light and dark) and rename the id, for example `[data-style="sepia"]`.
2. Change the colours. Every variable set in the light block must also be set in the dark block; the check script enforces this.
3. Add `{id:'sepia', label:'Sepia'}` to `styles` in `js/config.js`. The label can be plain text or an i18n key (for example `style.sepia`, with the text in `i18n/en.json`).
4. Run `node scripts/check.mjs`, then try the style in both modes.

Keep text contrast at **4.5:1 or more** (7:1 for accessibility-focused styles) against both `--surface` and `--bg`. Any WCAG contrast checker will tell you the ratio for two hex colours.

## Adding a font pair

1. Add the families to the Google Fonts `@import` at the top of `css/themes.css`, or self-host them with `@font-face` rules.
2. Add a `[data-fonts="your-id"]` block that sets `--font-display`, `--font-body` and `--font-mono`. End each list with `var(--cjk)` and a generic family so Chinese, Japanese and Korean still render.
3. Add the pair to `fontPairs` in `js/config.js`.

Fonts are only downloaded when they're used, so extra pairs don't slow down the page for people who don't choose them.
