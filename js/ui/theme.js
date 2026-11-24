/* Display settings: light/dark mode, visual style and font pair
   The look itself is defined in css/themes.css; the lists of styles and font pairs in js/config.js.
   Choices are applied as attributes on <html>: data-mode (light/dark), data-style and data-fonts. */
'use strict';

const LS_THEME = 'p3d.theme', LS_STYLE = 'p3d.style', LS_FONTS = 'p3d.fonts';
const THEMES = ['system', 'light', 'dark'];
const darkQuery = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;

const lsGet = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
const lsSet = (k, v, dflt) => { try { if (v === dflt) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e){} };
const optLabel = o => { const t = T(o.label); return t === o.label && !(o.label in EN) ? o.label : t; };

function savedTheme(){ const t = lsGet(LS_THEME); return THEMES.includes(t) ? t : 'system'; }
function savedStyle(){ const v = lsGet(LS_STYLE); return CONFIG.styles.some(s => s.id === v) ? v : CONFIG.styles[0].id; }
function savedFonts(){ const v = lsGet(LS_FONTS); return CONFIG.fontPairs.some(s => s.id === v) ? v : CONFIG.fontPairs[0].id; }

function applyDisplay(){
  const root = document.documentElement, t = savedTheme();
  root.dataset.mode = t === 'system' ? (darkQuery && darkQuery.matches ? 'dark' : 'light') : t;
  const st = savedStyle(), fp = savedFonts();
  if (st === CONFIG.styles[0].id) delete root.dataset.style; else root.dataset.style = st;
  if (fp === CONFIG.fontPairs[0].id) delete root.dataset.fonts; else root.dataset.fonts = fp;
}
function fillThemeSelect(){
  fillSelect($('theme'), THEMES.map(t => [t, T('theme.' + t)]), savedTheme());
  fillSelect($('style'), CONFIG.styles.map(s => [s.id, optLabel(s)]), savedStyle());
  fillSelect($('fonts'), CONFIG.fontPairs.map(s => [s.id, optLabel(s)]), savedFonts());
}
function setTheme(t){ lsSet(LS_THEME, THEMES.includes(t) ? t : 'system', 'system'); applyDisplay(); }
function setStyle(id){ lsSet(LS_STYLE, id, CONFIG.styles[0].id); applyDisplay(); }
function setFonts(id){ lsSet(LS_FONTS, id, CONFIG.fontPairs[0].id); applyDisplay(); }

if (darkQuery){
  const onChange = () => { if (savedTheme() === 'system') applyDisplay(); };
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', onChange); else darkQuery.addListener(onChange);
}
applyDisplay();
