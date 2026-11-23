/* Colour theme
   'system' (default) follows the operating system's light/dark setting; 'light' and 'dark' force one. */
'use strict';

const LS_THEME = 'p3d.theme';
const THEMES = ['system', 'light', 'dark'];

function savedTheme(){
  try { const t = localStorage.getItem(LS_THEME); return THEMES.includes(t) ? t : 'system'; } catch(e){ return 'system'; }
}
function applyTheme(t){
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
function fillThemeSelect(){
  fillSelect($('theme'), THEMES.map(t => [t, T('theme.' + t)]), savedTheme());
}
function setTheme(t){
  if (!THEMES.includes(t)) t = 'system';
  try { if (t === 'system') localStorage.removeItem(LS_THEME); else localStorage.setItem(LS_THEME, t); } catch(e){}
  applyTheme(t);
}
